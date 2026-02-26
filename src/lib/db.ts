import { supabase } from './supabase';

export interface TrackRecord {
    date: string;
    users: number;
}

export interface ExtensionData {
    id: string;
    cws_id: string;
    title: string;
    url: string;
    history: TrackRecord[];
}

// Extract the ID from the URL (e.g. string after the last slash)
export function getExtensionId(url: string) {
    const parts = url.split('/');
    let id = parts[parts.length - 1];
    // Remove query params if any
    if (id.includes('?')) id = id.split('?')[0];
    return id;
}

export async function trackExtension(url: string, title: string, userCountStr: string) {
    const cws_id = getExtensionId(url);
    const users = parseInt(userCountStr.replace(/[^\d]/g, ''), 10) || 0;
    const today = new Date().toISOString().split('T')[0];

    // 1. Get or Insert Extension
    let { data: ext, error: extError } = await supabase
        .from('extensions')
        .select('*')
        .eq('cws_id', cws_id)
        .single();

    if (!ext) {
        const { data: newExt, error: insertError } = await supabase
            .from('extensions')
            .insert([{ cws_id, title, url }])
            .select()
            .single();

        if (insertError) throw insertError;
        ext = newExt;
    } else if (ext.title !== title) {
        // Optional: update title if changed
        await supabase.from('extensions').update({ title }).eq('id', ext.id);
        ext.title = title;
    }

    // 2. Insert or Update Today's History
    const { error: histError } = await supabase
        .from('track_history')
        .upsert({
            extension_id: ext.id,
            date: today,
            users
        }, { onConflict: 'extension_id, date' });

    if (histError) throw histError;

    return ext;
}

export async function getAllExtensionsWithHistory(): Promise<ExtensionData[]> {
    const { data: extensions, error: extError } = await supabase
        .from('extensions')
        .select(`
      id,
      cws_id,
      title,
      url,
      track_history (
        date,
        users
      )
    `)
        .order('created_at', { ascending: true });

    if (extError) throw extError;

    // Transform to match the old DbSchema interface so frontend doesn't break
    return (extensions || []).map(ext => {
        // Sort history by date internally
        const history = (ext.track_history || []).sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return {
            id: ext.id,
            cws_id: ext.cws_id,
            title: ext.title,
            url: ext.url,
            history: history.map((h: any) => ({ date: h.date, users: h.users }))
        };
    });
}
