/**
 * WanderTag messages, German — the reference locale.
 *
 * A plain typed dictionary rather than a compile-step i18n library: with two
 * locales and one app, `Messages` as a TypeScript type already does the job a
 * generated catalogue would — a missing or misspelled key fails `svelte-check`.
 * Interpolation is a function per message, so plural rules and unit formatting
 * stay in the locale file instead of leaking into components.
 */
export const de = {
	appName: 'WanderTag',
	tagline: 'Hinterlasse Notizen, wo du warst.',
	heroLead:
		'Schreibe eine Notiz an den Ort, an dem du stehst. Andere finden sie nur, wenn sie selbst dorthin kommen.',
	heroCta: 'Karte öffnen',

	landing: {
		eyebrowHow: 'So funktioniert es',
		howTitle: 'Digitale Spuren in 3 Schritten',
		steps: [
			{
				number: '01',
				title: 'Geh zu einem Ort, der dir etwas bedeutet',
				text: 'Ein Gipfel, eine Ruine, eine Quelle im Wald. Über 100.000 solcher Orte sind in WanderTag schon eingetragen — in Deutschland, Österreich und der Schweiz. Die Karte zeigt dir, was in deiner Umgebung liegt.',
				img: '/how_to_1.svg',
				alt: 'Person wandert durch den Wald.'
			},
			{
				number: '02',
				title: 'Hinterlasse deine Notiz vor Ort',
				text: 'Angekommen? Dann schreibe, was andere hier wissen sollten — ein Tipp, eine Erinnerung, ein Gruß. Die Notiz bleibt an genau diesem Punkt liegen. Lesen kann sie nur, wer selbst hierher kommt.',
				img: '/how_to_2.svg',
				alt: 'Person neben einem Handy, das eine Notiz am Standort ablegt.'
			},
			{
				number: '03',
				title: 'Sammle Orte, die noch niemand entdeckt hat',
				text: 'Wer einen Pin als Erster erreicht, bekommt die Erstbegehung — dauerhaft, mit Namen in der Rangliste. Jeder Tag, an dem du etwas entdeckst, verlängert deine Serie.',
				img: '/how_to_3.svg',
				alt: 'Zwei Personen beim Wandern, eine sitzt in einem Zelt.'
			}
		],
		eyebrowFeatures: 'Warum WanderTag',
		featuresTitle: 'Nähe ist die ganze Mechanik',
		features: [
			{
				title: 'Nie eine leere Karte',
				text: (m: string) =>
					`Gipfel, Aussichtspunkte, Hütten, Burgen und Quellen aus OpenStreetMap sind vorab eingetragen. Auch beim ersten Öffnen liegt etwas im Umkreis von ${m}.`
			},
			{
				title: 'Lesen kostet Schritte',
				text: (m: string) =>
					`Notizen siehst du von weitem als Markierung — lesen und schreiben kannst du erst ab ${m} Entfernung. Der Weg dorthin ist der Preis.`
			},
			{
				title: 'Erstbegehung zählt',
				text: 'Der erste Mensch an einem Pin wird dauerhaft dort vermerkt. Dazu Serien, Statistiken und eine Rangliste — ewig und pro Monat.'
			}
		],
		eyebrowSignup: 'Registrieren',
		signupTitle: 'Fang bei dir vor der Tür an',
		signupLead:
			'Kostenlos, ohne Abo. Du brauchst nur eine E-Mail-Adresse und ein Passwort — den Rest macht dein Standort.',
		emailLabel: 'E-Mail-Adresse',
		emailPlaceholder: 'du@beispiel.de',
		signupCta: 'Konto anlegen',
		signupHint: 'Weiter geht es bei unserer Anmeldung, wo du dein Passwort setzt.',
		alreadyMember: 'Du hast schon ein Konto?',
		browseInstead: 'Erst mal nur umsehen',
		footerRights: (year: number) => `© WanderTag ${year}`,
		navHow: 'So geht es',
		navFeatures: 'Warum',
		navSignup: 'Registrieren'
	},

	nav: {
		label: 'Hauptnavigation',
		map: 'Karte',
		list: 'Liste',
		places: 'Orte',
		board: 'Rangliste',
		profile: 'Profil',
		admin: 'Admin'
	},

	auth: {
		login: 'Anmelden',
		register: 'Registrieren',
		logout: 'Abmelden',
		loginPrompt: 'Melde dich an, um Notizen zu hinterlassen und Pins zu entdecken.'
	},

	map: {
		locating: 'Standort wird bestimmt …',
		locationDenied:
			'Standortzugriff verweigert. WanderTag braucht deinen Standort, um zu funktionieren.',
		locationUnavailable: 'Standortbestimmung ist auf diesem Gerät nicht verfügbar.',
		enableLocation: 'Standort freigeben',
		recenter: 'Zentrieren',
		gpsGood: 'GPS gut',
		gpsFair: 'GPS mittel',
		gpsPoor: 'GPS schwach',
		gpsUnknown: 'GPS unbekannt',
		nothingNearby: 'Nichts in der Nähe. Zoome heraus oder geh ein Stück weiter.',
		revealRadius: (m: number) => `Sichtbar im Umkreis von ${formatDistance(m)}`,
		interactRadius: (m: number) => `Lesen und Entdecken ab ${formatDistance(m)} Entfernung`
	},

	directions: {
		start: 'Navigation starten',
		hint: 'Öffnet deine Karten-App mit Fußweg zum Ziel.'
	},

	legend: {
		title: 'Zeichenerklärung',
		show: 'Zeichenerklärung anzeigen',
		undiscovered: 'Ort, noch unentdeckt',
		discovered: 'Ort, von dir entdeckt',
		available: 'Ort, von anderen entdeckt',
		adminPin: 'Von der Redaktion gesetzt',
		note: 'Ort, von einer Person angelegt',
		you: 'Dein Standort',
		hint: 'Grün und Sand sind Orte, Türkis sind Menschen.'
	},
	zoom: {
		in: 'Hineinzoomen',
		out: 'Herauszoomen'
	},

	pin: {
		locked: 'Zu weit weg',
		lockedHint: (m: number) =>
			`Komm auf ${formatDistance(m)} heran, um hier zu lesen und zu schreiben.`,
		discover: 'Pin entdecken',
		discovered: 'Entdeckt',
		beTheFirst: 'Noch unentdeckt — sei der Erste!',
		notes: (n: number) => (n === 1 ? '1 Notiz' : `${n} Notizen`),
		noNotes: 'Noch keine Notizen hier.',
		elevation: (m: number) => `${m} m ü. NN`,
		distanceAway: (m: number) => `${formatDistance(m)} entfernt`,
		categories: {
			PEAK: 'Gipfel',
			VIEWPOINT: 'Aussichtspunkt',
			ALPINE_HUT: 'Berghütte',
			WILDERNESS_HUT: 'Schutzhütte',
			SHELTER: 'Unterstand',
			RUINS: 'Ruine',
			CASTLE: 'Burg',
			MONUMENT: 'Denkmal',
			MEMORIAL: 'Gedenkstätte',
			SPRING: 'Quelle',
			WATERFALL: 'Wasserfall',
			CAVE: 'Höhle',
			OBSERVATION_TOWER: 'Aussichtsturm',
			DRINKING_WATER: 'Trinkwasser',
			OTHER: 'Ort'
		}
	},

	note: {
		drop: 'Notiz hinterlassen',
		title: 'Titel',
		titlePlaceholder: 'Worum geht es?',
		body: 'Nachricht',
		bodyPlaceholder: 'Was sollen andere hier erfahren? (optional)',
		charsLeft: (n: number) => `${n} Zeichen übrig`,
		submit: 'Hinterlassen',
		cancel: 'Abbrechen',
		delete: 'Löschen',
		deleteConfirm: 'Diese Notiz wirklich löschen?',
		created: 'Notiz hinterlassen.',
		deleted: 'Notiz gelöscht.',
		by: (name: string) => `von ${name}`,
		readCount: (n: number) => (n === 1 ? '1 Mal gelesen' : `${n} Mal gelesen`),
		lockedBody: 'Der Inhalt wird sichtbar, wenn du dort bist.',
		emptyNearby: 'Keine Notizen in der Nähe.',
		yourNote: 'Deine Notiz',
		placeName: 'Name des Ortes',
		placeNamePlaceholder: 'Wie heißt dieser Ort? (optional)',
		placeNameHint: 'Hier entsteht ein neuer Ort. Andere können später eigene Notizen hinzufügen.',
		atPin: (name: string) => `bei ${name}`
	},

	rating: {
		label: 'Bewertung',
		giveStars: (n: number) => (n === 1 ? '1 Stern geben' : `${n} Sterne geben`),
		votes: (n: number) => (n === 1 ? '1 Bewertung' : `${n} Bewertungen`),
		none: 'Noch nicht bewertet',
		yours: 'Deine Bewertung',
		needCloser: 'Bewerten geht nur vor Ort.'
	},

	game: {
		discovered: 'Entdeckt!',
		firstBlood: 'Erstbegehung!',
		firstBloodHint: 'Du bist der erste Mensch, der diesen Pin entdeckt hat.',
		streak: (n: number) => (n === 1 ? '1 Tag Serie' : `${n} Tage Serie`),
		streakLabel: 'Serie',
		pinsUncovered: 'Entdeckte Pins',
		firstBloods: 'Erstbegehungen',
		notesDropped: 'Notizen',
		longestStreak: 'Längste Serie',
		thisMonth: 'Diesen Monat',
		alreadyDiscovered: 'Diesen Pin hattest du schon.'
	},

	board: {
		title: 'Rangliste',
		global: 'Ewig',
		monthly: 'Dieser Monat',
		empty: 'Noch niemand hat etwas entdeckt. Deine Chance.',
		rank: 'Platz',
		player: 'Name',
		discoveries: 'Pins'
	},

	profile: {
		title: 'Profil',
		language: 'Sprache',
		theme: 'Darstellung',
		themeLight: 'Hell',
		themeDark: 'Dunkel',
		themeSystem: 'System',
		stats: 'Statistik',
		adminBadge: 'Admin'
	},

	admin: {
		title: 'Pins verwalten',
		createPin: 'Pin anlegen',
		createHint: 'Tippe lange auf die Karte, um dort einen Pin zu setzen.',
		name: 'Name',
		description: 'Beschreibung',
		category: 'Kategorie',
		featured: 'Hervorgehoben',
		hidden: 'Ausgeblendet',
		save: 'Speichern',
		created: 'Pin angelegt.',
		updated: 'Pin gespeichert.',
		deleted: 'Pin gelöscht.',
		deleteConfirm: 'Diesen Pin wirklich löschen? Alle Entdeckungen dazu gehen verloren.'
	},

	friends: {
		title: 'Freunde',
		addLabel: 'Name der Person',
		addPlaceholder: 'z. B. hiker',
		add: 'Anfrage senden',
		requestSent: 'Anfrage gesendet.',
		pendingIncoming: 'Wartet auf deine Antwort',
		pendingOutgoing: 'Anfrage gesendet',
		accepted: 'Deine Freunde',
		accept: 'Annehmen',
		decline: 'Ablehnen',
		remove: 'Entfernen',
		removeConfirm: 'Diese Freundschaft wirklich beenden?',
		shareMine: 'Meinen Standort für diese Person freigeben',
		sharingOn: 'Du teilst deinen Standort',
		sharingOff: 'Du teilst deinen Standort nicht',
		theyShare: 'Teilt den Standort mit dir',
		theyDontShare: 'Teilt den Standort nicht',
		empty: 'Noch keine Freunde. Schick jemandem eine Anfrage.',
		privacy:
			'Standortfreigabe gilt pro Person und pro Richtung und ist standardmäßig aus. Geteilt wird immer nur die letzte Position, die du in der App bestätigt hast — kein Tracking im Hintergrund.',
		lastSeen: (when: string) => `zuletzt ${when}`,
		stats: (pins: number) => (pins === 1 ? '1 Pin' : `${pins} Pins`),
		onMap: 'Freunde auf der Karte'
	},
	admin2: {
		title: 'Verwaltung',
		tabPins: 'Pins',
		tabUsers: 'Nutzer',
		tabActivity: 'Aktivität',
		tabViolations: 'Auffälligkeiten',
		active: 'Aktiv',
		deactivated: 'Deaktiviert',
		blocked: 'Gesperrt',
		deactivate: 'Deaktivieren',
		activate: 'Aktivieren',
		unblock: 'Sperre aufheben',
		deactivateConfirm: 'Diese Person wirklich deaktivieren? Sie kann dann nichts mehr eintragen.',
		blockedUntil: (when: string) => `gesperrt bis ${when}`,
		violationsRecent: (n: number) => `${n} Auffälligkeiten (30 min)`,
		noUsers: 'Noch keine Nutzer.',
		noActivity: 'Noch keine Entdeckungen.',
		noViolations: 'Keine Auffälligkeiten.',
		firstBlood: 'Erstbegehung',
		deactivatedNote: 'Deaktivierte Konten können sich noch anmelden, aber nichts mehr eintragen.'
	},

	paging: {
		search: 'Suchen',
		searchPlaceholder: 'Name eingeben …',
		filters: 'Filter',
		clear: 'Zurücksetzen',
		results: (n: number) => (n === 1 ? '1 Treffer' : `${n} Treffer`),
		page: (p: number, total: number) => `Seite ${p} von ${total}`,
		prev: 'Zurück',
		next: 'Weiter',
		none: 'Keine Treffer.',
		anyCategory: 'Alle Kategorien',
		anySource: 'Alle Quellen',
		sourceOsm: 'Aus OpenStreetMap',
		sourceAdmin: 'Selbst gesetzt',
		sourceUser: 'Von Nutzern angelegt',
		onlyHidden: 'Nur ausgeblendete'
	},

	error: {
		tooFarAway: 'Du bist zu weit weg.',
		implausible: 'Diese Positionsänderung ist nicht plausibel.',
		generic: 'Etwas ist schiefgelaufen.',
		notFound: 'Nicht gefunden.',
		retry: 'Nochmal versuchen'
	},

	dev: {
		setLocation: 'Standort festlegen (Entwicklung)',
		explainer:
			'Desktop-Browser haben kein GPS. Brave nutzt zudem keinen Netzwerk-Standortdienst, deshalb bleibt der Standort dort oft leer. Hier kannst du ihn von Hand setzen.',
		lat: 'Breite',
		lon: 'Länge',
		useMapCentre: 'Kartenmitte übernehmen',
		apply: 'Übernehmen',
		clear: 'Zurücksetzen (Gerät nutzen)',
		badLat: 'Breite muss zwischen -90 und 90 liegen.',
		badLon: 'Länge muss zwischen -180 und 180 liegen.',
		overrideActive: 'Standort manuell gesetzt'
	},

	common: {
		loading: 'Lädt …',
		close: 'Schließen',
		attribution: 'Kartendaten © OpenStreetMap-Mitwirkende (ODbL)'
	}
};

export type Messages = typeof de;

/** Metres up close, kilometres further out — nobody reads "3412 m". */
function formatDistance(metres: number): string {
	if (metres < 1000) return `${Math.round(metres)} m`;
	return `${(metres / 1000).toFixed(metres < 10_000 ? 1 : 0).replace('.', ',')} km`;
}
