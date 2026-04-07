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
  _lastFromCache: false,

  _toCache(key, data) {
    try {
      localStorage.setItem('auswanderung_cache_' + key, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (e) { /* localStorage full, ignore */ }
  },

  _fromCache(key) {
    try {
      var cached = JSON.parse(localStorage.getItem('auswanderung_cache_' + key));
      if (cached && cached.data) {
        console.info('Using cached data for ' + key + ' (age: ' + Math.round((Date.now() - cached.timestamp) / 60000) + ' min)');
        return cached.data;
      }
    } catch (e) {}
    return key === 'stays' || key === 'docs' || key === 'costs' ? [] : {};
  },

  _getCacheTimestamp(key) {
    try {
      var cached = JSON.parse(localStorage.getItem('auswanderung_cache_' + key));
      if (cached && cached.timestamp) return cached.timestamp;
    } catch (e) {}
    return null;
  },

  isUsingCache() {
    return this._lastFromCache;
  },

  // --- Action States (checkboxes) ---

  async loadCompleted() {
    if (!sb) { this._lastFromCache = true; return this._fromCache('completed'); }
    try {
      const { data, error } = await sb
        .from('action_states')
        .select('id, completed');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.id] = r.completed; });
      this._toCache('completed', map);
      this._lastFromCache = false;
      return map;
    } catch (e) {
      console.warn('loadCompleted online failed, using cache:', e);
      this._lastFromCache = true;
      return this._fromCache('completed');
    }
  },

  async saveCompleted(id, completed) {
    if (!sb) return;
    try {
      const { error } = await sb
        .from('action_states')
        .upsert({ id, completed, updated_at: new Date().toISOString() });
      if (error) throw error;
    } catch (e) { console.warn('saveCompleted:', e); throw e; }
  },

  // --- Document Notes ---

  async loadDocNotes() {
    if (!sb) { this._lastFromCache = true; return this._fromCache('docnotes'); }
    try {
      const { data, error } = await sb
        .from('doc_notes')
        .select('id, note');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.id] = r.note; });
      this._toCache('docnotes', map);
      this._lastFromCache = false;
      return map;
    } catch (e) {
      console.warn('loadDocNotes online failed, using cache:', e);
      this._lastFromCache = true;
      return this._fromCache('docnotes');
    }
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
    if (!sb) { this._lastFromCache = true; return this._fromCache('docs'); }
    try {
      const { data, error } = await sb
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      var result = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        type: d.file_type,
        size: d.file_size,
        storagePath: d.storage_path,
        uploaded: d.uploaded_at,
        url: `${SUPABASE_URL}/storage/v1/object/public/documents/${d.storage_path}`
      }));
      this._toCache('docs', result);
      this._lastFromCache = false;
      return result;
    } catch (e) {
      console.warn('loadDocs online failed, using cache:', e);
      this._lastFromCache = true;
      return this._fromCache('docs');
    }
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
  },

  // --- Milestone Notes ---

  async loadMilestoneNotes() {
    if (!sb) { this._lastFromCache = true; return this._fromCache('milestonenotes'); }
    try {
      const { data, error } = await sb
        .from('milestone_notes')
        .select('id, milestone_title, note');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.id] = r.note; });
      this._toCache('milestonenotes', map);
      this._lastFromCache = false;
      return map;
    } catch (e) {
      console.warn('loadMilestoneNotes online failed, using cache:', e);
      this._lastFromCache = true;
      return this._fromCache('milestonenotes');
    }
  },

  async saveMilestoneNote(id, milestoneTitle, note) {
    if (!sb) return;
    try {
      if (!note) {
        await sb.from('milestone_notes').delete().eq('id', id);
      } else {
        await sb.from('milestone_notes')
          .upsert({ id, milestone_title: milestoneTitle, note, updated_at: new Date().toISOString() });
      }
    } catch (e) { console.warn('saveMilestoneNote:', e); }
  },

  // --- Stay Log ---

  async loadStays() {
    if (!sb) { this._lastFromCache = true; return this._fromCache('stays'); }
    try {
      const { data, error } = await sb
        .from('stay_log')
        .select('*')
        .order('entry_date', { ascending: false });
      if (error) throw error;
      this._toCache('stays', data || []);
      this._lastFromCache = false;
      return data || [];
    } catch (e) {
      console.warn('loadStays online failed, using cache:', e);
      this._lastFromCache = true;
      return this._fromCache('stays');
    }
  },

  async saveStay(stay) {
    if (!sb) return;
    try {
      const { error } = await sb
        .from('stay_log')
        .upsert({
          id: stay.id,
          country: stay.country,
          entry_date: stay.entry_date,
          exit_date: stay.exit_date || null,
          notes: stay.notes || null,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    } catch (e) { console.warn('saveStay:', e); throw e; }
  },

  async deleteStay(id) {
    if (!sb) return;
    try {
      const { error } = await sb
        .from('stay_log')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) { console.warn('deleteStay:', e); throw e; }
  },

  // --- Costs ---

  async loadCosts() {
    if (!sb) { this._lastFromCache = true; return this._fromCache('costs'); }
    try {
      const { data, error } = await sb
        .from('costs')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      var result = (data || []).map(d => ({
        id: d.id,
        firm: d.firm,
        label: d.label,
        amount: d.amount,
        interval: d.interval,
        notes: d.notes
      }));
      this._toCache('costs', result);
      this._lastFromCache = false;
      return result;
    } catch (e) {
      console.warn('loadCosts online failed, using cache:', e);
      this._lastFromCache = true;
      return this._fromCache('costs');
    }
  },

  async saveCost(cost) {
    if (!sb) return;
    try {
      const { error } = await sb
        .from('costs')
        .upsert({
          id: cost.id,
          firm: cost.firm,
          label: cost.label,
          amount: cost.amount,
          interval: cost.interval,
          notes: cost.notes || null,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    } catch (e) { console.warn('saveCost:', e); throw e; }
  },

  // --- Online-Status ---
  isOnline: function () {
    return sb != null;
  },

  async deleteCost(id) {
    if (!sb) return;
    try {
      const { error } = await sb
        .from('costs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) { console.warn('deleteCost:', e); throw e; }
  }
};
