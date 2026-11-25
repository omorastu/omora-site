/**
 * Elora's lines: Ashan's approved script, word for word, and the eight takes
 * they're recorded in. Plain data, nothing imported: the film reads it
 * (script.ts), and so does video/scripts/voice-v2.mjs, which cuts the takes
 * into a file per line.
 */

/**
 * Every line she says, Ashan's approved script word for word, by its id (its
 * file's name). Each is split into the chunks its captions show, in order;
 * joined with spaces they're the line.
 */
export const LINES = {
  // Shared, before the pick.
  "hook-1": ["Hi, I’m Elora, Ashan and Jordan’s assistant."],
  "hook-2": ["They help businesses get found, get booked, and take the busywork off your plate."],
  "hook-3": ["But they always start the same way: by listening, to find your first leak."],
  "hook-4": ["Pick your business, and I’ll show you."],
  // 1 Getting found.
  "winery-found": ["Say someone’s planning a tasting this weekend,", "and your winery’s on page two, where no one looks."],
  "dental-found": ["Say a parent searches for an orthodontist nearby,", "and your practice is on page two, where no one looks."],
  "contractor-found": ["Say a homeowner needs a remodel,", "and your company’s on page two, where no one looks."],
  "general-found": ["Say someone’s looking for what you do,", "and you’re on page two, where no one looks."],
  "found-top": ["They get you to the top when people search,", "and into the answer when people ask AI, which more and more of them do."],
  // 2 Reviews.
  "reviews-shared": ["Almost everyone reads your reviews before they call.", "Businesses that reply to them earn about thirty-five percent more,", "and most don’t reply at all."],
  "winery-reviews": ["Guests write about the host who knew every bottle, and the view.", "They make sure every review gets a thoughtful reply,", "and happy guests get a nudge to leave one."],
  "dental-reviews": ["Patients write about the wait, the front desk, and how gentle you were.", "They make sure every review gets a careful reply,", "and happy patients get a nudge to leave one."],
  "contractor-reviews": [
    "Homeowners write about whether you showed up on time, kept them posted, and cleaned up.",
    "They make sure every review gets a reply,",
    "and happy clients get a nudge to leave one.",
  ],
  "general-reviews": ["Customers write about how you made them feel.", "They make sure every review gets a reply,", "and happy customers get a nudge to leave one."],
  // 3 The website.
  "site-shared": ["If your website’s dated and cluttered, people leave.", "They build one that’s clear and easy to use."],
  "winery-site": ["So guests can explore your wines, and know exactly how to visit."],
  "dental-site": ["So families can see your practice, and know exactly how to book a consult."],
  "contractor-site": ["So homeowners can see your work, and know exactly how to get a quote."],
  "general-site": ["So people can see what you do, and know exactly what to do next."],
  // 4 Booking.
  "winery-booking": ["Booking tastings by text and email means sorting it all by hand.", "Now guests book in a click, and it’s confirmed on its own."],
  "dental-booking": ["Booking consults by phone tag means sorting it all by hand.", "Now patients book in a click, and it’s confirmed on its own."],
  "contractor-booking": [
    "Chasing estimates by text and voicemail means sorting it all by hand.",
    "Now homeowners book a site visit in a click, and it’s confirmed on its own.",
  ],
  "general-booking": ["Booking by text and email means sorting it all by hand.", "Now customers book in a click, and it’s confirmed on its own."],
  // 5 Calls.
  "winery-calls": ["When the tasting room’s busy, the phone goes unanswered.", "Now every call is picked up, booked in, and followed up, even after hours."],
  "dental-calls": ["When the front desk is with a patient, the phone goes unanswered.", "Now every call is picked up, booked in, and followed up, even after hours."],
  "contractor-calls": ["When you’re on a job site, the phone goes unanswered.", "Now every call is picked up, booked in, and followed up, even after hours."],
  "general-calls": ["When you’re busy, the phone goes unanswered.", "Now every call is picked up, booked in, and followed up, even after hours."],
  // 6 Behind the scenes, and a tool of their own.
  office: ["Behind the scenes, the same details get typed in two or three times.", "They make one entry fill in everywhere."],
  "winery-tools": ["And if something eats up hours every week,", "they build a tool for it, around how you work."],
  "dental-tools": ["And they build tools around how you work,", "like one that writes up each consult and drafts the follow-up."],
  "contractor-tools": ["And if something eats up hours every week, like writing up estimates,", "they build a tool for it."],
  "general-tools": ["And if something eats up hours every week,", "they build a tool for it, around how you work."],
  // 7 Photo & video.
  "winery-photo": ["They shoot photos and video that capture your vineyard,", "and turn them into posts people see."],
  "dental-photo": ["Here’s a shoot they did.", "They’d do the same at your practice,", "so it feels welcoming before anyone walks in."],
  "contractor-photo": ["They shoot photos and video of your finished work,", "so it sells the next job for you."],
  "general-photo": ["They shoot photos and video that show what you do,", "and turn them into posts people see."],
  // After each chapter, its own question (also the question card's heading): getting found's, then reviews', the
  // website's, booking's, calls', behind the scenes and a tool's (one question for both), and photo and video's.
  "ask-1": ["Real quick, is this something your business needs?"],
  "ask-reviews": ["What about your reviews?"],
  "ask-site": ["Could your website use this?"],
  "ask-booking": ["Would online booking help you?"],
  "ask-calls": ["Are calls slipping through?"],
  "ask-office": ["Could you use a few hours back?"],
  "ask-photo": ["And last one, photos and video?"],
  // The plan, the close, and the note they send.
  plan: ["After the first call, you get it all on one page:", "what they’ll do, in what order, and how long it takes."],
  close: ["One plan, built by the two of them,", "and looked after once it’s live.", "If that sounds right, book a call."],
  send: [
    "Since you said yes, we’ve already written your message.",
    "Just add your name, your business and how to reach you,",
    "and they’ll get back to you within the hour.",
    "They’re excited to add real value to your business.",
  ],
} as const satisfies Record<string, readonly string[]>;
/**
 * Recorded, but no longer in the film: still in their takes, so the cutting
 * script finds them by their words, and skips them. The closer look's (gone
 * in round 10), the old photo line for a practice and the old send line
 * (both said again, new, in take-r11), and the short question after every
 * chapter but the first (each has its own since round 11.3; its file,
 * public/m/film/voice/v2/ask-2.m4a, is left where it is).
 */
export const RETIRED = {
  closer: ["Want a closer look at any of it?", "Pick one, or go straight to your plan."],
  "ask-2": ["And this one?"],
  "dental-photo-old": ["They shoot photos and video that make your practice feel welcoming,", "before anyone walks in."],
  "send-old": ["Send them a quick note, and they’ll get back to you within the hour."],
} as const satisfies Record<string, readonly string[]>;
export type RetiredId = keyof typeof RETIRED;
export type VoiceId = keyof typeof LINES;
/** Where her lines' files are (video/scripts/voice-v2.mjs makes them). */
export const voiceFile = (id: VoiceId) => `/m/film/voice/v2/${id}.m4a`;
/** The eight takes, as recorded, and the lines in each, in order (video/voice/v2/). */
export const TAKES: Record<string, readonly (VoiceId | RetiredId)[]> = {
  "take-shared": ["hook-1", "hook-2", "hook-3", "hook-4", "found-top", "site-shared", "office", "closer", "plan", "close"],
  "take-winery": ["winery-found", "winery-site", "winery-booking", "winery-calls", "winery-tools", "winery-photo"],
  "take-dental": ["dental-found", "dental-site", "dental-booking", "dental-calls", "dental-tools", "dental-photo-old"],
  "take-contractor": ["contractor-found", "contractor-site", "contractor-booking", "contractor-calls", "contractor-tools", "contractor-photo"],
  "take-general": ["general-found", "general-site", "general-booking", "general-calls", "general-tools", "general-photo"],
  "take-extra": ["ask-1", "ask-2", "send-old"],
  "take-r11": ["reviews-shared", "winery-reviews", "dental-reviews", "contractor-reviews", "general-reviews", "dental-photo", "send"],
  "take-asks": ["ask-reviews", "ask-site", "ask-booking", "ask-calls", "ask-office", "ask-photo"],
};
