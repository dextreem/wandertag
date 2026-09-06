import type { Messages } from './de';

/** English messages. Typed as [Messages], so a key missing here fails the build. */
export const en: Messages = {
	appName: 'WanderTag',
	tagline: 'Leave notes where you have been.',
	heroLead:
		'Write a note at the place you are standing. Others only find it if they come here themselves.',
	heroCta: 'Open the map',

	landing: {
		eyebrowHow: 'How it works',
		howTitle: 'Leave a digital footprint in 3 steps',
		steps: [
			{
				number: '01',
				title: 'Go somewhere that means something to you',
				text: 'A summit, a ruin, a spring in the woods. Over 100,000 such places are already in WanderTag across Germany, Austria and Switzerland. The map shows you what lies around you.',
				img: '/how_to_1.svg',
				alt: 'Person hiking through the woods.'
			},
			{
				number: '02',
				title: 'Leave your note on the spot',
				text: 'Arrived? Write what others should know about this place — a tip, a memory, a greeting. The note stays at exactly this point. Only someone who comes here can read it.',
				img: '/how_to_2.svg',
				alt: 'Person beside a phone dropping a note at their location.'
			},
			{
				number: '03',
				title: 'Collect places nobody has reached yet',
				text: 'Reach a pin before anyone else and the first ascent is yours — permanently, with your name on the leaderboard. Every day you discover something extends your streak.',
				img: '/how_to_3.svg',
				alt: 'Two people hiking, one sitting in a tent.'
			}
		],
		eyebrowFeatures: 'Why WanderTag',
		featuresTitle: 'Proximity is the whole mechanic',
		features: [
			{
				title: 'Never an empty map',
				text: (m: string) =>
					`Peaks, viewpoints, huts, castles and springs from OpenStreetMap are already in place. Even on your first visit, something lies within ${m}.`
			},
			{
				title: 'Reading costs footsteps',
				text: (m: string) =>
					`You see notes from afar as markers — but you can only read and write them from ${m} away. The walk there is the price.`
			},
			{
				title: 'First ascents count',
				text: 'The first person to reach a pin is recorded there for good. Plus streaks, stats and a leaderboard — all-time and monthly.'
			}
		],
		eyebrowSignup: 'Sign up',
		signupTitle: 'Start on your own doorstep',
		signupLead:
			'Free, no subscription. All you need is an email address and a password — your location does the rest.',
		emailLabel: 'Email address',
		emailPlaceholder: 'you@example.com',
		signupCta: 'Create account',
		signupHint: 'You will continue at our sign-in page to set a password.',
		alreadyMember: 'Already have an account?',
		browseInstead: 'Just look around first',
		footerRights: (year: number) => `© WanderTag ${year}`,
		navHow: 'How',
		navFeatures: 'Why',
		navSignup: 'Sign up'
	},

	nav: {
		label: 'Main navigation',
		map: 'Map',
		list: 'List',
		places: 'Places',
		board: 'Board',
		profile: 'Profile',
		admin: 'Admin'
	},

	auth: {
		login: 'Sign in',
		register: 'Sign up',
		logout: 'Sign out',
		loginPrompt: 'Sign in to leave notes and uncover pins.'
	},

	map: {
		locating: 'Finding your location …',
		locationDenied: 'Location access denied. WanderTag needs your location to work.',
		locationUnavailable: 'Location services are not available on this device.',
		enableLocation: 'Enable location',
		recenter: 'Recentre',
		gpsGood: 'GPS good',
		gpsFair: 'GPS fair',
		gpsPoor: 'GPS weak',
		gpsUnknown: 'GPS unknown',
		nothingNearby: 'Nothing nearby. Zoom out or walk a little further.',
		revealRadius: (m: number) => `Visible within ${formatDistance(m)}`,
		interactRadius: (m: number) => `Read and uncover from ${formatDistance(m)} away`
	},

	directions: {
		start: 'Start navigation',
		hint: 'Opens your maps app with a walking route to the target.'
	},

	legend: {
		title: 'Legend',
		show: 'Show legend',
		undiscovered: 'Place, undiscovered',
		discovered: 'Place you uncovered',
		available: 'Place others uncovered',
		adminPin: 'Curated pin',
		note: 'Place created by a person',
		you: 'Your location',
		hint: 'Green and sand are places, teal is people.'
	},
	zoom: {
		in: 'Zoom in',
		out: 'Zoom out'
	},

	pin: {
		locked: 'Too far away',
		lockedHint: (m: number) => `Get within ${formatDistance(m)} to read and write here.`,
		discover: 'Uncover pin',
		discovered: 'Uncovered',
		beTheFirst: 'Undiscovered — be the first!',
		notes: (n: number) => (n === 1 ? '1 note' : `${n} notes`),
		noNotes: 'No notes here yet.',
		elevation: (m: number) => `${m} m above sea level`,
		distanceAway: (m: number) => `${formatDistance(m)} away`,
		categories: {
			PEAK: 'Peak',
			VIEWPOINT: 'Viewpoint',
			ALPINE_HUT: 'Alpine hut',
			WILDERNESS_HUT: 'Wilderness hut',
			SHELTER: 'Shelter',
			RUINS: 'Ruins',
			CASTLE: 'Castle',
			MONUMENT: 'Monument',
			MEMORIAL: 'Memorial',
			SPRING: 'Spring',
			WATERFALL: 'Waterfall',
			CAVE: 'Cave',
			OBSERVATION_TOWER: 'Observation tower',
			DRINKING_WATER: 'Drinking water',
			OTHER: 'Place'
		}
	},

	note: {
		drop: 'Leave a note',
		title: 'Title',
		titlePlaceholder: 'What is this about?',
		body: 'Message',
		bodyPlaceholder: 'What should others know about this place? (optional)',
		charsLeft: (n: number) => `${n} characters left`,
		submit: 'Leave it',
		cancel: 'Cancel',
		delete: 'Delete',
		deleteConfirm: 'Really delete this note?',
		created: 'Note left.',
		deleted: 'Note deleted.',
		by: (name: string) => `by ${name}`,
		readCount: (n: number) => (n === 1 ? 'read once' : `read ${n} times`),
		lockedBody: 'The content unlocks when you are there.',
		emptyNearby: 'No notes nearby.',
		yourNote: 'Your note',
		placeName: 'Name of the place',
		placeNamePlaceholder: 'What is this place called? (optional)',
		placeNameHint: 'This creates a new place. Others can add their own notes here later.',
		atPin: (name: string) => `at ${name}`
	},

	rating: {
		label: 'Rating',
		giveStars: (n: number) => (n === 1 ? 'Give 1 star' : `Give ${n} stars`),
		votes: (n: number) => (n === 1 ? '1 rating' : `${n} ratings`),
		none: 'Not rated yet',
		yours: 'Your rating',
		needCloser: 'You can only rate on the spot.'
	},

	game: {
		discovered: 'Uncovered!',
		firstBlood: 'First blood!',
		firstBloodHint: 'You are the first person ever to uncover this pin.',
		streak: (n: number) => (n === 1 ? '1 day streak' : `${n} day streak`),
		streakLabel: 'Streak',
		pinsUncovered: 'Pins uncovered',
		firstBloods: 'First bloods',
		notesDropped: 'Notes',
		longestStreak: 'Longest streak',
		thisMonth: 'This month',
		alreadyDiscovered: 'You had already uncovered this pin.'
	},

	board: {
		title: 'Leaderboard',
		global: 'All time',
		monthly: 'This month',
		empty: 'Nobody has uncovered anything yet. Your chance.',
		rank: 'Rank',
		player: 'Name',
		discoveries: 'Pins'
	},

	profile: {
		title: 'Profile',
		language: 'Language',
		theme: 'Appearance',
		themeLight: 'Light',
		themeDark: 'Dark',
		themeSystem: 'System',
		stats: 'Stats',
		adminBadge: 'Admin'
	},

	admin: {
		title: 'Manage pins',
		createPin: 'Create pin',
		createHint: 'Long-press the map to place a pin there.',
		name: 'Name',
		description: 'Description',
		category: 'Category',
		featured: 'Featured',
		hidden: 'Hidden',
		save: 'Save',
		created: 'Pin created.',
		updated: 'Pin saved.',
		deleted: 'Pin deleted.',
		deleteConfirm: 'Really delete this pin? Every discovery of it will be lost.'
	},

	friends: {
		title: 'Friends',
		addLabel: "Person's name",
		addPlaceholder: 'e.g. hiker',
		add: 'Send request',
		requestSent: 'Request sent.',
		pendingIncoming: 'Waiting for your answer',
		pendingOutgoing: 'Request sent',
		accepted: 'Your friends',
		accept: 'Accept',
		decline: 'Decline',
		remove: 'Remove',
		removeConfirm: 'Really end this friendship?',
		shareMine: 'Share my location with this person',
		sharingOn: 'You are sharing your location',
		sharingOff: 'You are not sharing your location',
		theyShare: 'Shares their location with you',
		theyDontShare: 'Does not share their location',
		empty: 'No friends yet. Send someone a request.',
		privacy:
			'Location sharing is per person and per direction, and off by default. Only the last position you confirmed in the app is shared — there is no background tracking.',
		lastSeen: (when: string) => `last seen ${when}`,
		stats: (pins: number) => (pins === 1 ? '1 pin' : `${pins} pins`),
		onMap: 'Friends on the map'
	},
	admin2: {
		title: 'Administration',
		tabPins: 'Pins',
		tabUsers: 'Users',
		tabActivity: 'Activity',
		tabViolations: 'Anomalies',
		active: 'Active',
		deactivated: 'Deactivated',
		blocked: 'Blocked',
		deactivate: 'Deactivate',
		activate: 'Activate',
		unblock: 'Lift block',
		deactivateConfirm: 'Really deactivate this person? They will not be able to contribute.',
		blockedUntil: (when: string) => `blocked until ${when}`,
		violationsRecent: (n: number) => `${n} anomalies (30 min)`,
		noUsers: 'No users yet.',
		noActivity: 'No discoveries yet.',
		noViolations: 'No anomalies.',
		firstBlood: 'First ascent',
		deactivatedNote: 'Deactivated accounts can still sign in, but cannot contribute anything.'
	},

	paging: {
		search: 'Search',
		searchPlaceholder: 'Type a name …',
		filters: 'Filters',
		clear: 'Reset',
		results: (n: number) => (n === 1 ? '1 result' : `${n} results`),
		page: (p: number, total: number) => `Page ${p} of ${total}`,
		prev: 'Back',
		next: 'Next',
		none: 'No results.',
		anyCategory: 'All categories',
		anySource: 'All sources',
		sourceOsm: 'From OpenStreetMap',
		sourceAdmin: 'Curated',
		sourceUser: 'Left by a user',
		onlyHidden: 'Hidden only'
	},

	error: {
		tooFarAway: 'You are too far away.',
		implausible: 'That change of position is not plausible.',
		generic: 'Something went wrong.',
		notFound: 'Not found.',
		retry: 'Try again'
	},

	dev: {
		setLocation: 'Set location (development)',
		explainer:
			'Desktop browsers have no GPS, and Brave does not use a network location service either, so the position often stays empty there. Set it by hand instead.',
		lat: 'Latitude',
		lon: 'Longitude',
		useMapCentre: 'Use map centre',
		apply: 'Apply',
		clear: 'Reset (use the device)',
		badLat: 'Latitude must be between -90 and 90.',
		badLon: 'Longitude must be between -180 and 180.',
		overrideActive: 'Location set manually'
	},

	common: {
		loading: 'Loading …',
		close: 'Close',
		attribution: 'Map data © OpenStreetMap contributors (ODbL)'
	}
};

function formatDistance(metres: number): string {
	if (metres < 1000) return `${Math.round(metres)} m`;
	return `${(metres / 1000).toFixed(metres < 10_000 ? 1 : 0)} km`;
}
