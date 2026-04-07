// =============================================
// AUSWANDERUNG — Supabase Database Layer
// =============================================

const SUPABASE_URL = 'https://ucudnzlgpqbwshnmmldy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdWRuemxncHFid3Nobm1tbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODQxNzIsImV4cCI6MjA5MTE2MDE3Mn0.MTrI95U9GdjdTo7hdXiK9KLY95tMhFKWV36TdmxzkrQ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DB = {
  // --- Action States (checkboxes) ---

  async loadCompleted() {
    const { data, error } = await supabase
      .from('action_states')
      .select('id, completed');
    if (error) { console.error('loadCompleted:', error); return {}; }
    const map = {};
    (data || []).forEach(r => { map[r.id] = r.completed; });
    return map;
  },

  async saveCompleted(id, completed) {
    const { error } = await supabase
      .from('action_states')
      .upsert({ id, completed, updated_at: new Date().toISOString() });
    if (error) console.error('saveCompleted:', error);
  },

  // --- Document Notes ---

  async loadDocNotes() {
    const { data, error } = await supabase
      .from('doc_notes')
      .select('id, note');
    if (error) { console.error('loadDocNotes:', error); return {}; }
    const map = {};
    (data || []).forEach(r => { map[r.id] = r.note; });
    return map;
  },

  async saveDocNote(id, note) {
    if (!note) {
      await supabase.from('doc_notes').delete().eq('id', id);
    } else {
      await supabase.from('doc_notes')
        .upsert({ id, note, updated_at: new Date().toISOString() });
    }
  },

  // --- Documents (metadata + storage) ---

  async loadDocs() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) { console.error('loadDocs:', error); return []; }
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      category: d.category,
      type: d.file_type,
      size: d.file_size,
      storagePath: d.storage_path,
      uploaded: d.uploaded_at,
      // Build public URL
      url: `${SUPABASE_URL}/storage/v1/object/public/documents/${d.storage_path}`
    }));
  },

  async uploadDoc(file, name, category) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const ext = file.name.split('.').pop();
    const storagePath = `${id}.${ext}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file);
    if (uploadError) { console.error('uploadDoc storage:', uploadError); return null; }

    // Save metadata
    const { error: dbError } = await supabase
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
    if (dbError) { console.error('uploadDoc db:', dbError); return null; }

    return id;
  },

  async deleteDoc(id, storagePath) {
    await supabase.storage.from('documents').remove([storagePath]);
    await supabase.from('documents').delete().eq('id', id);
  }
};
