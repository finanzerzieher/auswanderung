// =============================================
// AUSWANDERUNG — Daten
// Alle Termine, Aufgaben, Länder-Regeln
// =============================================

const DATA = {
  // Person
  person: {
    name: 'Viktor Frickel',
    currentCity: 'Dortmund',
    partner: 'Karina'
  },

  // Phasen
  phases: [
    {
      id: 'prep',
      name: 'Vorbereitung',
      status: 'active', // completed | active | upcoming
      progress: 0.6
    },
    {
      id: 'deregister',
      name: 'Abmeldung',
      status: 'upcoming',
      progress: 0
    },
    {
      id: 'llc',
      name: 'LLC-Gründung',
      status: 'upcoming',
      progress: 0
    },
    {
      id: 'transition',
      name: 'Umstellung',
      status: 'upcoming',
      progress: 0
    },
    {
      id: 'travel',
      name: 'Perpetual Traveler',
      status: 'upcoming',
      progress: 0
    }
  ],

  // Meilensteine / Zeitstrahl
  milestones: [
    {
      date: '2026-04-07',
      title: 'Internationale KV recherchieren',
      desc: 'SafetyWing, Foyer, Passportcard vergleichen und abschließen',
      status: 'active',
      phase: 'prep'
    },
    {
      date: '2026-04-07',
      title: 'EU-Postbox einrichten',
      desc: 'Viktor Frickel, CAYA Postbox 1010050, 96035 Bamberg',
      status: 'completed',
      phase: 'prep'
    },
    {
      date: '2026-04-14',
      title: 'Caya: Alternativ-Adresse anfragen',
      desc: 'Adresse ohne "Postbox" im Namen — wird nicht automatisch angezeigt, muss aktiv angefragt werden',
      status: 'upcoming',
      phase: 'prep'
    },
    {
      date: '2026-06-02',
      title: 'Private Versicherungen kündigen',
      desc: 'Deutsche KV und private Versicherungen kündigen. Berufshaftpflicht behalten!',
      status: 'upcoming',
      phase: 'deregister',
      deps: 'Ab Abmeldung möglich (Versicherungspflicht entfällt). Internationale KV muss vorher stehen.'
    },
    {
      date: '2026-05-15',
      title: 'Compliance-Adresse organisieren',
      desc: 'MailboxNow o.ä. — echte Straßenadresse, Stadt wo du NIE gemeldet warst',
      status: 'upcoming',
      phase: 'prep'
    },
    {
      date: '2026-06-02',
      title: 'Wohnsitz abmelden',
      desc: 'Bürgerbüro Dortmund — "Längere Auslandsreise Südostasien"',
      status: 'upcoming',
      phase: 'deregister'
    },
    {
      date: '2026-06-02',
      title: 'Finanzamt informieren',
      desc: 'Am selben Tag E-Mail: "Habe mich abgemeldet". 16-Fragen-Fragebogen → alles Nein, KEINE Betriebsaufgabe',
      status: 'upcoming',
      phase: 'deregister'
    },
    {
      date: '2026-06-02',
      title: 'Gewerbeamt: Adressänderung',
      desc: 'Adresse auf CAYA Postbox 1010050, 96035 Bamberg ändern',
      status: 'upcoming',
      phase: 'deregister',
      deps: 'Am Tag der Abmeldung'
    },
    {
      date: '2026-06-03',
      title: 'LLC beauftragen',
      desc: 'Wyoming LLC über Finanznoma, Express-Verfahren. 1 Tag NACH Abmeldung!',
      status: 'upcoming',
      phase: 'llc',
      deps: 'Wohnsitz muss abgemeldet sein',
      critical: true
    },
    {
      date: '2026-06-06',
      title: 'Flug nach Bangkok',
      desc: 'Deutschland verlassen. Innerhalb 1 Monat nach Abmeldung.',
      status: 'upcoming',
      phase: 'llc',
      critical: true
    },
    {
      date: '2026-06-20',
      title: 'LLC-Dokumente empfangen',
      desc: 'LLC-Unterlagen in Bangkok empfangen, EIN beantragen',
      status: 'upcoming',
      phase: 'llc',
      deps: 'LLC muss beauftragt sein'
    },
    {
      date: '2026-07-01',
      title: 'Wise Business einrichten',
      desc: 'Belgische IBAN + Mercury/Relay US-Konto eröffnen',
      status: 'upcoming',
      phase: 'transition',
      deps: 'LLC-Dokumente müssen vorliegen'
    },
    {
      date: '2026-07-15',
      title: 'Fondsfinanz: Bankverbindung ändern',
      desc: 'Schritt 1: Bankverbindung auf Wise Business IBAN umstellen',
      status: 'upcoming',
      phase: 'transition',
      deps: 'Wise Business muss eingerichtet sein'
    },
    {
      date: '2026-07-20',
      title: 'Fondsfinanz: Rechnungsanschrift ändern',
      desc: 'Schritt 2: Auf LLC-Compliance-Adresse umstellen (paar Tage nach Bank)',
      status: 'upcoming',
      phase: 'transition',
      deps: 'Bankverbindung muss umgestellt sein'
    },
    {
      date: '2026-07-25',
      title: 'Fondsfinanz: Steuernummer ändern',
      desc: 'Schritt 3: EIN + Null eintragen. USt-Situation klären.',
      status: 'upcoming',
      phase: 'transition',
      deps: 'Rechnungsanschrift muss umgestellt sein'
    }
  ],

  // Nächste Aktionen (kontextbezogen, abhängig von Phase)
  actions: [
    {
      title: 'Internationale Krankenversicherung vergleichen & abschließen',
      date: '2026-04-30',
      tag: 'warning',
      tagText: 'Bald fällig',
      completed: false,
      id: 'kv',
      phase: 'prep'
    },
    {
      title: 'EU-Postbox eingerichtet — CAYA Postbox 1010050, 96035 Bamberg',
      date: null,
      tag: 'info',
      tagText: 'Erledigt',
      completed: true,
      id: 'postbox',
      phase: 'prep'
    },
    {
      title: 'Caya: Alternativ-Adresse ohne "Postbox" im Namen anfragen',
      date: '2026-04-14',
      tag: 'warning',
      tagText: 'Bald fällig',
      dependency: 'Caya zeigt das nicht automatisch — aktiv anfragen!',
      completed: false,
      id: 'caya-alt',
      phase: 'prep'
    },
    {
      title: 'Compliance-Adresse für LLC organisieren (MailboxNow)',
      date: '2026-05-15',
      tag: 'info',
      tagText: 'Vorbereitung',
      completed: false,
      id: 'compliance-addr',
      phase: 'prep'
    },
    {
      title: 'Erweiterte beschränkte Steuerpflicht prüfen',
      date: '2026-05-15',
      tag: 'critical',
      tagText: 'Vor Auswanderung!',
      dependency: 'Muss VOR Abmeldung geklärt sein',
      completed: false,
      id: 'erw-steuerpflicht',
      phase: 'prep'
    },
    {
      title: 'Flug nach Bangkok buchen',
      date: '2026-06-06',
      tag: 'info',
      tagText: 'Planung',
      completed: false,
      id: 'flug',
      phase: 'travel'
    },
    {
      title: 'Abmeldebestätigung mehrfach sichern (digital + physisch)',
      date: '2026-06-02',
      tag: 'critical',
      tagText: 'Kritisch',
      dependency: 'Nach Abmeldung am Bürgerbüro',
      completed: false,
      id: 'abmelde-copy',
      phase: 'deregister'
    },
    {
      title: 'Geburtsurkunde mit Apostille — erledigt ✓',
      date: null,
      tag: 'info',
      tagText: 'Erledigt',
      completed: true,
      id: 'geburtsurkunde',
      phase: 'prep'
    },
    {
      title: 'Internationaler Führerschein — erledigt ✓',
      date: null,
      tag: 'info',
      tagText: 'Erledigt',
      completed: true,
      id: 'fuehrerschein',
      phase: 'prep'
    }
  ],

  // Offene Punkte
  openItems: [
    {
      title: 'Compliance-Wohnsitz Paraguay',
      desc: 'Über Finanznoma-Coaching. Nächster Gruppenflug voraussichtlich November 2026. Viktor will mitfliegen.',
      status: 'pending',
      statusText: 'November 2026'
    },
    {
      title: 'Erw. beschränkte Steuerpflicht',
      desc: 'Prüfen ob Auslöser vorliegen (§ 2 AStG). Falls ja: vor Auswanderung beseitigen. Finanznoma ansprechen.',
      status: 'pending',
      statusText: 'Vor Abmeldung klären'
    },
    {
      title: 'Langfrist-Visa-Strategie',
      desc: 'Thailand-Visa, SEA-Rotation, oder feste Basis? DTV (Destination Thailand Visa) prüfen.',
      status: 'research',
      statusText: 'Recherche'
    },
    {
      title: 'Wise Business Compliance',
      desc: 'Wise bei >10k/Mo langfristig tragbar? Alternative: Mercury als primäres Geschäftskonto.',
      status: 'pending',
      statusText: 'Offen'
    },
    {
      title: 'Thailand Remittance-Regel',
      desc: 'Wise Business Card für lokale Ausgaben = "Remittance"? Mit Finanznoma klären.',
      status: 'pending',
      statusText: 'Offen'
    },
    {
      title: 'Internationale KV',
      desc: 'SafetyWing, Foyer, Passportcard vergleichen. Muss vor Kündigung der deutschen KV stehen.',
      status: 'pending',
      statusText: 'Entscheidung nötig'
    }
  ],

  // Länder mit Visa-Regeln
  countries: [
    {
      name: 'Thailand',
      flag: '🇹🇭',
      maxStay: 60,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry', // Max Tage pro Einreise
      rules: [
        { label: 'Visum', value: 'Visa Exemption 60 Tage' },
        { label: 'Verlängerung', value: '+30 Tage (Immigration Office)' },
        { label: 'DTV', value: '5 Jahre Multi-Entry, 180 Tage/Aufenthalt' },
        { label: 'Steuer', value: 'Remittance-basiert seit 2024' }
      ]
    },
    {
      name: 'Malaysia',
      flag: '🇲🇾',
      maxStay: 90,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      rules: [
        { label: 'Visum', value: 'Visa-frei 90 Tage' },
        { label: 'DE2 Visa', value: 'Digital Nomad Visa, 1 Jahr' },
        { label: 'Steuer', value: 'Territorial — kein Auslandseinkommen besteuert' }
      ]
    },
    {
      name: 'Georgien',
      flag: '🇬🇪',
      maxStay: 365,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'continuous', // Max ununterbrochener Aufenthalt
      rules: [
        { label: 'Visum', value: 'Visa-frei 1 Jahr' },
        { label: 'Steuer', value: 'Territorial — Auslandseinkommen steuerfrei' },
        { label: 'Vorteil', value: 'Günstig, EU-nah, gute Infrastruktur' }
      ]
    },
    {
      name: 'Indonesien',
      flag: '🇮🇩',
      maxStay: 30,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      rules: [
        { label: 'Visum', value: 'VoA 30 Tage, verlängerbar auf 60' },
        { label: 'B211A', value: '60 Tage Business Visa' },
        { label: 'Steuer', value: 'Nur lokales Einkommen' }
      ]
    },
    {
      name: 'Portugal',
      flag: '🇵🇹',
      maxStay: 90,
      stayUnit: 'Tage / 180 Tage',
      daysUsed: 0,
      ruleType: 'rolling', // Schengen 90/180
      windowDays: 180,
      schengen: true,
      rules: [
        { label: 'Visum', value: 'Schengen 90/180 Tage' },
        { label: 'NHR', value: 'Non-Habitual Resident — Sonderstatus' },
        { label: 'Achtung', value: 'Zählt gegen Schengen-Kontingent' }
      ]
    },
    {
      name: 'VAE (Dubai)',
      flag: '🇦🇪',
      maxStay: 90,
      stayUnit: 'Tage / 180 Tage',
      daysUsed: 0,
      ruleType: 'rolling', // 90 Tage je 180 Tage
      windowDays: 180,
      rules: [
        { label: 'Visum', value: 'Visa-frei 90 Tage je 180 Tage' },
        { label: 'Freelancer', value: 'Freelance Visa ab ~$1.000/Jahr' },
        { label: 'Steuer', value: '0% Einkommensteuer' }
      ]
    }
  ],

  // Countdowns
  countdowns: [
    { id: 'deregister', label: 'Abmeldung', date: '2026-06-02', detail: '' },
    { id: 'llc', label: 'LLC beauftragen', date: '2026-06-03', detail: '1 Tag nach Abmeldung' },
    { id: 'departure', label: 'Abflug Bangkok', date: '2026-06-06', detail: '' }
  ],

  // Compliance-Pflichten
  compliance: [
    { firm: 'LLC', task: 'Wyoming Annual Report', dueMonth: 1, dueDay: 1, interval: 'jährlich', note: 'Über Registered Agent' },
    { firm: 'Einzelunternehmen', task: 'IHK-Beitrag', dueMonth: 3, dueDay: 31, interval: 'jährlich', note: '' },
    { firm: 'Einzelunternehmen', task: 'Berufshaftpflicht-Verlängerung', dueMonth: null, dueDay: null, interval: 'jährlich', note: 'Genaues Datum prüfen' },
    { firm: 'LLC', task: 'Wise Business Statement', dueMonth: null, dueDay: null, interval: 'monatlich', note: '' },
    { firm: 'Einzelunternehmen', task: 'Steuererklärung', dueMonth: 7, dueDay: 31, interval: 'jährlich', note: 'Nuller-Erklärung' }
  ],

  // Firmenstruktur
  structure: {
    einzelunternehmen: {
      title: 'Einzelunternehmen',
      subtitle: 'Leere Hülle — §34d + Berufshaftpflicht',
      rows: [
        { label: 'Zweck', value: '§34d-Zulassung + Berufshaftpflicht erhalten' },
        { label: 'Adresse', value: 'CAYA Postbox 1010050, 96035 Bamberg' },
        { label: 'Konto', value: 'Qonto — Minimalbetrieb' },
        { label: 'Umsatz', value: '~600–1.000€/Jahr (Gewinnerzielungsabsicht)' },
        { label: 'IHK', value: 'Mitgliedschaft aktiv' },
        { label: 'Wichtig', value: 'NICHT abmelden, keine Betriebsaufgabe' }
      ]
    },
    llc: {
      title: 'US-LLC (Wyoming)',
      subtitle: 'Operatives Geschäft — steuerlich transparent',
      rows: [
        { label: 'Gründung', value: 'Finanznoma, Express-Verfahren' },
        { label: 'DBA', value: '"Viktor Frickel" (ohne LLC im Namen)' },
        { label: 'Adresse', value: 'Echte Straßenadresse (MailboxNow)' },
        { label: 'Bank', value: 'Wise Business (IBAN) + Mercury (US)' },
        { label: 'Steuer-Nr.', value: 'US-EIN (9→10–11 Stellen mit Null)' },
        { label: 'Steuer', value: 'Transparent — am Wohnsitz versteuert' }
      ]
    },
    connector: {
      title: 'Fondsfinanz-Anbindung',
      desc: 'Vermittlernummer bleibt gleich. Stufenweise Umstellung: Bank → Adresse → Steuernummer. Stornoreserve bleibt.'
    }
  }
};
