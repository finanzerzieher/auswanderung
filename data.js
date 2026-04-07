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
      date: '2026-04-15',
      title: 'Internationale KV recherchieren',
      desc: 'SafetyWing, Foyer, Passportcard vergleichen',
      status: 'active',
      phase: 'prep'
    },
    {
      date: '2026-05-15',
      title: 'Internationale KV abschlie\u00dfen',
      desc: 'Muss VOR K\u00fcndigung der deutschen KV stehen. Ohne internationale KV keine Absicherung nach Abmeldung!',
      status: 'upcoming',
      phase: 'prep',
      deps: 'Recherche abgeschlossen',
      critical: true
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
      title: 'Caya: Alternativ-Adresse f\u00fcr Einzelunternehmen anfragen',
      desc: 'F\u00fcr das Einzelunternehmen: Caya-Adresse OHNE "Postbox" im Namen anfragen. Das ist NICHT die LLC-Compliance-Adresse!',
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
      date: '2026-06-02',
      title: 'Private Versicherungen k\u00fcndigen',
      desc: 'Sonderk\u00fcndigungsrecht durch Abmeldung: Deutsche KV, Haftpflicht, Hausrat sofort k\u00fcndbar. Berufshaftpflicht BEHALTEN!',
      status: 'upcoming',
      phase: 'deregister',
      deps: 'Internationale KV muss vorher abgeschlossen sein. Sonderk\u00fcndigungsrecht greift ab Abmeldung.'
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
      date: '2026-06-15',
      title: 'LLC-Dokumente empfangen',
      desc: 'LLC-Unterlagen in Bangkok empfangen (Operating Agreement, Articles of Organization)',
      status: 'upcoming',
      phase: 'llc',
      deps: 'LLC muss beauftragt sein'
    },
    {
      date: '2026-06-15',
      title: 'EIN beantragen (Express)',
      desc: 'US-Steuernummer f\u00fcr die LLC \u2014 \u00fcber Finanznoma Express in wenigen Tagen. Ohne EIN kein Bankkonto!',
      status: 'upcoming',
      phase: 'llc',
      deps: 'LLC-Dokumente m\u00fcssen vorliegen'
    },
    {
      date: '2026-06-20',
      title: 'DBA-Registrierung (Doing Business As)',
      desc: '"Viktor Frickel" als DBA registrieren \u2014 damit LLC ohne "LLC" im Namen auftreten kann',
      status: 'upcoming',
      phase: 'llc',
      deps: 'LLC muss gegr\u00fcndet sein'
    },
    {
      date: '2026-06-20',
      title: 'Compliance-Adresse f\u00fcr LLC einrichten',
      desc: 'MailboxNow o.\u00e4. \u2014 echte Stra\u00dfenadresse auf die LLC, Stadt wo du NIE gemeldet warst. Erst m\u00f6glich wenn LLC gegr\u00fcndet ist.',
      status: 'upcoming',
      phase: 'llc',
      deps: 'LLC + DBA m\u00fcssen vorliegen'
    },
    {
      date: '2026-07-01',
      title: 'Wise Business einrichten',
      desc: 'Belgische IBAN + Mercury/Relay US-Konto er\u00f6ffnen',
      status: 'upcoming',
      phase: 'transition',
      deps: 'LLC-Dokumente + EIN m\u00fcssen vorliegen'
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
      title: 'Fondsfinanz: Rechnungsanschrift \u00e4ndern',
      desc: 'Schritt 2: Auf LLC-Compliance-Adresse umstellen (paar Tage nach Bank)',
      status: 'upcoming',
      phase: 'transition',
      deps: 'Bankverbindung muss umgestellt sein UND Compliance-Adresse eingerichtet'
    },
    {
      date: '2026-07-25',
      title: 'Fondsfinanz: Steuernummer ändern',
      desc: 'Schritt 3: EIN + Null eintragen. USt-Situation klären.',
      status: 'upcoming',
      phase: 'transition',
      deps: 'Rechnungsanschrift muss umgestellt sein'
    },
    {
      date: '2026-08-01',
      title: 'Erste Fondsfinanz-Abrechnung pr\u00fcfen',
      desc: 'Pr\u00fcfen ob Abrechnung korrekt auf LLC l\u00e4uft: richtige IBAN, richtige Adresse, richtige Steuernummer',
      status: 'upcoming',
      phase: 'transition',
      deps: 'Alle 3 Fondsfinanz-Umstellungen m\u00fcssen abgeschlossen sein',
      critical: true
    },
    {
      date: '2026-11-01',
      title: 'Paraguay: Compliance-Wohnsitz einrichten',
      desc: 'Gruppenflug mit Finanznoma. Cedula + Steuer-ID beantragen. Sch\u00fctzt gegen erweiterte Steuerpflicht in Deutschland.',
      status: 'upcoming',
      phase: 'travel',
      deps: 'Finanznoma Gruppenflug'
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
      title: 'Caya: Alternativ-Adresse f\u00fcr Einzelunternehmen anfragen',
      date: '2026-04-14',
      tag: 'warning',
      tagText: 'Bald f\u00e4llig',
      dependency: 'F\u00fcr das Einzelunternehmen, NICHT f\u00fcr die LLC! Caya zeigt das nicht automatisch.',
      completed: false,
      id: 'caya-alt',
      phase: 'prep'
    },
    {
      title: 'Compliance-Adresse f\u00fcr LLC einrichten (MailboxNow)',
      date: '2026-06-20',
      tag: 'info',
      tagText: 'Nach LLC-Gr\u00fcndung',
      dependency: 'Erst m\u00f6glich wenn LLC gegr\u00fcndet ist',
      completed: false,
      id: 'compliance-addr',
      phase: 'llc'
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
      title: 'Flug nach Bangkok gebucht \u2014 06.06.2026',
      date: null,
      tag: 'info',
      tagText: 'Erledigt',
      completed: true,
      id: 'flug',
      phase: 'prep'
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
      name: 'Deutschland',
      flag: '\u{1F1E9}\u{1F1EA}',
      maxStay: 30,
      stayUnit: 'Tage/Jahr',
      daysUsed: 0,
      ruleType: 'calendar_year',
      taxThreshold: 30,
      taxThresholdType: 'calendar_year',
      schengen: true,
      rules: [
        { label: 'Einreise', value: 'Als EU-B\u00fcrger unbegrenzt, aber steuerlich max. 30 Tage pro Jahr empfohlen' },
        { label: 'Steuer', value: 'Du kannst bis 2036 erweitert steuerpflichtig bleiben \u2014 auch wenn du abgemeldet bist. Deutschland darf dein Welteinkommen besteuern, wenn du in einem Niedrigsteuerland lebst.' },
        { label: 'Warnung', value: 'Keinen Schl\u00fcssel zu einer Wohnung behalten \u2014 auch nicht bei Karina! Wer Zugang zu einer Wohnung in Deutschland hat, gilt als dort wohnhaft und wird voll steuerpflichtig.' },
        { label: 'Warnung', value: 'Dein deutsches Einzelunternehmen k\u00f6nnte als Beweis gelten, dass du noch wirtschaftlich in Deutschland aktiv bist. Das muss unbedingt mit Finanznoma gekl\u00e4rt werden.' }
      ]
    },
    {
      name: 'Thailand',
      flag: '🇹🇭',
      maxStay: 60,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry', // Max Tage pro Einreise
      taxThreshold: 180, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Ohne Visum 60 Tage, verl\u00e4ngerbar um 30 Tage beim Immigration Office (1.900 Baht)' },
        { label: 'Langzeit', value: 'DTV-Visum: 5 Jahre g\u00fcltig, 180 Tage pro Einreise. Beste Option f\u00fcr Langzeit.' },
        { label: 'Warnung', value: '\u00dcber Landgrenzen nur 2 Einreisen pro Jahr erlaubt, jeweils nur 30 Tage und nicht verl\u00e4ngerbar! Am Flughafen kein Limit.' },
        { label: 'Steuer', value: 'Ab 180 Tagen pro Jahr wirst du steuerpflichtig. Jede Kartenzahlung und ATM-Abhebung in Thailand gilt als steuerpflichtiger Geldtransfer ins Land.' }
      ]
    },
    {
      name: 'Malaysia',
      flag: '🇲🇾',
      maxStay: 90,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'rolling',
      windowDays: 180,
      taxThreshold: 182, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Ohne Visum 90 Tage innerhalb von 180 Tagen' },
        { label: 'Langzeit', value: 'DE Rantau (Digital Nomad Visa): 1 Jahr, ab 24.000 USD Jahreseinkommen' },
        { label: 'Steuer', value: 'Seit 2022 wird Geld, das aus dem Ausland nach Malaysia \u00fcberwiesen wird, besteuert. Ausnahme bis 2036 wenn im Herkunftsland bereits versteuert.' }
      ]
    },
    {
      name: 'Georgien',
      flag: '🇬🇪',
      maxStay: 365,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'continuous', // Max ununterbrochener Aufenthalt
      taxThreshold: 183, taxThresholdType: 'rolling_year',
      rules: [
        { label: 'Einreise', value: 'Ohne Visum bis zu 1 Jahr am St\u00fcck' },
        { label: 'Steuer', value: 'Nur Einkommen das in Georgien selbst verdient wird, wird besteuert. Dein Auslandseinkommen bleibt steuerfrei.' },
        { label: 'Tipp', value: 'G\u00fcnstig, nah an Europa, gute Infrastruktur. Sehr beliebt bei Perpetual Travelers.' }
      ]
    },
    {
      name: 'Indonesien',
      flag: '🇮🇩',
      maxStay: 30,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 183, taxThresholdType: 'rolling_year',
      rules: [
        { label: 'Einreise', value: 'Visa on Arrival: 30 Tage, verl\u00e4ngerbar auf 60 Tage' },
        { label: 'Langzeit', value: 'Business Visa (B211A/C1): 60 Tage, verl\u00e4ngerbar auf bis zu 180 Tage' },
        { label: 'Warnung', value: 'Ab 183 Tagen wirst du auf dein gesamtes Welteinkommen besteuert (5-35%)! Nicht nur lokales Einkommen.' }
      ]
    },
    {
      name: 'Portugal',
      flag: '🇵🇹',
      maxStay: 90,
      stayUnit: 'Tage / 180 Tage',
      daysUsed: 0,
      ruleType: 'rolling', // Schengen 90/180
      taxThreshold: 183, taxThresholdType: 'rolling_year',
      windowDays: 180,
      schengen: true,
      rules: [
        { label: 'Einreise', value: 'Als EU-B\u00fcrger unbegrenzt (Freiz\u00fcgigkeit). Die 90/180-Tage-Regel gilt f\u00fcr dich nicht.' },
        { label: 'Steuer', value: 'Wer in einem beliebigen 12-Monats-Zeitraum 183 Tage in Portugal ist, wird dort steuerpflichtig. Auch ohne festen Wohnsitz!' },
        { label: 'Hinweis', value: 'Trotzdem z\u00e4hlt jeder Tag gegen dein Schengen-Kontingent bei der Grenzregistrierung.' },
        { label: 'Hinweis', value: 'Das NHR-Steuermodell wurde Ende 2023 eingestellt.' }
      ]
    },
    {
      name: 'VAE (Dubai)',
      flag: '🇦🇪',
      maxStay: 90,
      stayUnit: 'Tage / 180 Tage',
      daysUsed: 0,
      ruleType: 'rolling', // 90 Tage je 180 Tage
      taxThreshold: 183, taxThresholdType: 'rolling_year',
      windowDays: 180,
      rules: [
        { label: 'Einreise', value: 'Ohne Visum 90 Tage innerhalb von 180 Tagen' },
        { label: 'Langzeit', value: 'Freelance Visa ab ca. 1.000 USD pro Jahr' },
        { label: 'Steuer', value: 'Keine Einkommensteuer (0%). Seit 2023 gibt es 9% K\u00f6rperschaftsteuer f\u00fcr Firmen \u00fcber 375.000 AED Gewinn, betrifft aber die Wyoming LLC nicht.' }
      ]
    },
    {
      name: 'Vietnam',
      flag: '\u{1F1FB}\u{1F1F3}',
      maxStay: 90,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 183, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Ohne Visum 45 Tage (seit August 2023). F\u00fcr l\u00e4nger: E-Visa f\u00fcr 90 Tage (25-50 USD)' },
        { label: 'Verl\u00e4ngerung', value: 'Vor Ort m\u00f6glich' },
        { label: 'Warnung', value: 'Ab 183 Tagen wirst du auf dein gesamtes Welteinkommen besteuert (5-35%)! Nicht nur lokales Einkommen.' }
      ]
    },
    {
      name: 'Kambodscha',
      flag: '\u{1F1F0}\u{1F1ED}',
      maxStay: 30,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 183, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Visa bei Ankunft: 30 Tage f\u00fcr ca. 30 USD' },
        { label: 'Langzeit', value: 'Ordinary Visa (E-Type) vor Ort verl\u00e4ngerbar auf mehrere Monate' },
        { label: 'Steuer', value: 'Nur Einkommen das in Kambodscha verdient wird, wird besteuert.' },
        { label: 'Tipp', value: 'Klassischer Stopp f\u00fcr Visa-Runs aus Thailand' }
      ]
    },
    {
      name: 'Laos',
      flag: '\u{1F1F1}\u{1F1E6}',
      maxStay: 30,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 183, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Visa bei Ankunft: 30 Tage f\u00fcr 30-40 USD. Verl\u00e4ngerbar um bis zu 60 Tage.' },
        { label: 'Steuer', value: 'Nur Einkommen das in Laos verdient wird, wird besteuert.' },
        { label: 'Tipp', value: 'Klassischer Visa-Run aus Thailand \u00fcber Nong Khai oder Vientiane' }
      ]
    },
    {
      name: 'Japan',
      flag: '\u{1F1EF}\u{1F1F5}',
      maxStay: 90,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 0, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Ohne Visum 90 Tage. Verl\u00e4ngerbar auf 180 Tage (Abkommen Deutschland-Japan).' },
        { label: 'Warnung', value: 'Japan ist streng bei wiederholten Einreisen. Mindestens 90 Tage Pause zwischen Aufenthalten empfohlen.' },
        { label: 'Steuer', value: 'Japan besteuert nach Wohnsitz, nicht nach Aufenthaltstagen. Solange du keinen Lebensmittelpunkt in Japan hast, kein Steuerrisiko.' }
      ]
    },
    {
      name: 'S\u00fcdkorea',
      flag: '\u{1F1F0}\u{1F1F7}',
      maxStay: 90,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 183, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Ohne Visum 90 Tage. Elektronische Reisegenehmigung (K-ETA) ist bis Ende 2026 ausgesetzt, ab 2027 wieder Pflicht.' },
        { label: 'Steuer', value: 'Unter 183 Tagen: nur Einkommen das in S\u00fcdkorea verdient wird, wird besteuert.' }
      ]
    },
    {
      name: 'Mexiko',
      flag: '\u{1F1F2}\u{1F1FD}',
      maxStay: 180,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 183, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Per Passstempel bis zu 180 Tage. Achtung: Der Grenzbeamte entscheidet \u00fcber die Dauer, oft werden nur 30-90 Tage gestempelt!' },
        { label: 'Steuer', value: 'Ab 183 Tagen im Kalenderjahr steuerpflichtig. Auch m\u00f6glich wenn dein Lebensmittelpunkt in Mexiko liegt.' },
        { label: 'Tipp', value: 'Beliebte Langzeit-Base f\u00fcr Perpetual Travelers (Playa del Carmen, Mexiko-Stadt)' }
      ]
    },
    {
      name: 'Paraguay',
      flag: '\u{1F1F5}\u{1F1FE}',
      maxStay: 90,
      stayUnit: 'Tage',
      daysUsed: 0,
      ruleType: 'per_entry',
      taxThreshold: 120, taxThresholdType: 'calendar_year',
      rules: [
        { label: 'Einreise', value: 'Ohne Visum 90 Tage' },
        { label: 'Steuer', value: 'Nur Einkommen das in Paraguay verdient wird, wird besteuert. Dein LLC-Einkommen bleibt steuerfrei.' },
        { label: 'Compliance', value: 'Geplant als Compliance-Wohnsitz ab November 2026 \u00fcber Finanznoma. Sch\u00fctzt gegen die erweiterte Steuerpflicht in Deutschland.' }
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
    { firm: 'Einzelunternehmen', task: 'Steuererklärung', dueMonth: 7, dueDay: 31, interval: 'jährlich', note: 'Nuller-Erklärung' },
    { firm: 'LLC', task: 'Form 5472 + Pro-Forma 1120 (IRS)', dueMonth: 4, dueDay: 15, interval: 'jährlich', note: '$25.000 Strafe bei Nichtabgabe! Alle Transaktionen LLC \u2194 Viktor melden.' },
    { firm: 'LLC', task: 'BOI Report (FinCEN)', dueMonth: null, dueDay: null, interval: 'jährlich', note: 'Beneficial Ownership \u2014 Status pr\u00fcfen, rechtlich umstritten seit 2024' },
    { firm: 'LLC', task: 'Registered Agent Zahlung', dueMonth: null, dueDay: null, interval: 'jährlich', note: 'Ohne RA wird LLC aufgel\u00f6st' }
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
