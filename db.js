// =============================================
// AUSWANDERUNG — Supabase Database Layer
// =============================================

const SUPABASE_URL = 'https://ucudnzlgpqbwshnmmldy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWRuemxncHFid3Nobm1tbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODQxNzIsImV4cCI6MjA5MTE2MDE3Mn0.MTrI95U9GdjdTo7hdXiK9KLY95tMhFKWV36TdmxzkrQ';

let sb;
try {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error('Supabase init failed:', e);
  sb = null;
}

const DB = {
  // --- Action States (checkboxes) ---

  async loadCompleted() {
    if (!sb) return {};
    try {
      const { data, error } = await sb
        .from('action_states')
        .select('id, completed');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.id] = r.completed; });
      return map;
    } catch (e) { console.warn('loadCompleted:', e); return {}; }
  },

  async saveCompleted(id, completed) {
    if (!sb) return;
    try {
      await sb
        .from('action_states')
        .upsert({ id, completed, updated_at: new Date().toISOString() });
    } catch (e) { console.warn('saveCompleted:', e); }
  },

  // --- Document Notes ---

  async loadDocNotes() {
    if (!sb) return {};
    try {
      const { data, error } = await sb
        .from('doc_notes')
        .select('id, note');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.id] = r.note; });
      return map;
    } catch (e) { console.warn('loadDocNotes:', e); return {}; }
  },

  async saveDocNote(id, note) {
    if (!sb) return;
    try {
      if (!note) {
        await sb.from('doc_notes').delete().eq('id', id);
      } else {
        await sb.from('doc_notes')
          .upsert({ id, note, updated_at: new Date().toISOString() });
      }
    } catch (e) { console.warn('saveDocNote:', e); }
  },

  // --- Documents (metadata + storage) ---

  async loadDocs() {
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        type: d.file_type,
        size: d.file_size,
        storagePath: d.storage_path,
        uploaded: d.uploaded_at,
        url: `${SUPABASE_URL}/storage/v1/object/public/documents/${d.storage_path}`
      }));
    } catch (e) { console.warn('loadDocs:', e); return []; }
  },

  async uploadDoc(file, name, category) {
    if (!sb) return null;
    try {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const ext = file.name.split('.').pop();
      const storagePath = `${id}.${ext}`;

      const { error: uploadError } = await sb.storage
        .from('documents')
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await sb
        .from('documents')
        .insert({
          id,
          name,
          category,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          uploaded_at: new Date().toISOString()
        });
      if (dbError) throw dbError;

      return id;
    } catch (e) { console.warn('uploadDoc:', e); return null; }
  },

  async deleteDoc(id, storagePath) {
    if (!sb) return;
    try {
      await sb.storage.from('documents').remove([storagePath]);
      await sb.from('documents').delete().eq('id', id);
    } catch (e) { console.warn('deleteDoc:', e); }
  }
};
