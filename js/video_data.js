// ══════════════════════════════════════════════════════════════════
// js/video_data.js - the ONE place your videos are listed.
// Used by videos.html (everything) and music.html (anything with cat: 'music').
// ══════════════════════════════════════════════════════════════════
// VIDEO DATA - add a video by adding one line.
//
//   id        unique, no spaces                      (used in the share link #id)
//   cat       'clips' | 'compilations' | 'trailers' | 'music' | 'recordings' | 'videos'  (videos = Other)
//   title     shown on the card + screen
//   date      free text, e.g. 'Dec 2026'
//   blurb     one line under the title (optional)
//   length    '2:31' badge (optional)
//   emoji     shown if there's no thumbnail (optional)
//   -- ONE of these two sources --
//   src       path to an mp4/webm on the site, e.g. 'media/videos/first_stream.mp4'
//             (keep files under 25 MB each - that's the Cloudflare assets limit.
//              Bigger than that? Put it on YouTube as Unlisted and use yt below.)
//   yt        a YouTube video ID, e.g. 'dQw4w9WgXcQ'   (plays via youtube-nocookie)
//   poster    optional thumbnail image for src videos (otherwise the first frame is used)
//   ready     set false for a slot that's planned but not uploaded yet (shows as "coming soon")
// ══════════════════════════════════════════════════════════════════
// Shelf order = order of this list. A category with no ready videos is hidden
// automatically and shown in the "coming soon" note at the bottom instead.
const CATS = [
  { id: 'clips',        label: 'Clips',        blurb: 'the little moments' },
  { id: 'compilations', label: 'Compilations', blurb: 'the greatest hits' },
  { id: 'trailers',     label: 'Trailers',     blurb: 'video teasers' },
  { id: 'music',        label: 'Music Videos', blurb: 'videos for others or our music' },
  { id: 'recordings',   label: 'Recordings',   blurb: 'the full-length stuff' },
  { id: 'videos',       label: 'Other',        blurb: 'everything else' },
];

const VIDEOS = [
  // ---- Compilations ----
  { id: 'trailer-1', cat: 'compilations', title: 'Lang Zal Za Laven',     date: 'Jul 2026', emoji: '🎞️', src: 'media/birthday_2026/trailers/trailer_01.mp4' },
  { id: 'trailer-2', cat: 'compilations', title: 'Happy Birthday Annika', date: 'Jul 2026', emoji: '🎞️', src: 'media/birthday_2026/trailers/trailer_02.mp4' },

  // ---- Trailers ----
  { id: 'phasmo-trailer', cat: 'trailers', title: 'Phasmophobia Fashion Week 2026 Trailer', date: 'Dec 2026', blurb: 'The teaser trailer.', length: '09:30', emoji: '👻', yt: 'cFrRMf2jCms' },
  { id: 'trailer-3', cat: 'trailers', title: 'A Besties Production',          date: 'Jul 2026', emoji: '🎞️', src: 'media/birthday_2026/trailers/trailer_03.mp4' },
  { id: 'trailer-4', cat: 'trailers', title: 'CNT Crafts Returns: Trailer I',  date: 'Jul 2026', emoji: '🎞️', src: 'media/birthday_2026/trailers/trailer_04.mp4' },
  { id: 'trailer-5', cat: 'trailers', title: 'CNT Crafts Returns: Trailer II', date: 'Jul 2026', emoji: '🎞️', src: 'media/birthday_2026/trailers/trailer_05.mp4' },

  // ---- Clips ----
  { id: 'ann-feature-1', cat: 'clips', title: 'Content Warning Clip', date: 'Aug 2024', blurb: 'One of Ann\'s Famous Features', length: '3:12', emoji: '🎥', yt: 'aniMehbEqrw' },
  { id: 'ann-feature-2', cat: 'clips', title: 'Content Warning Clip', date: 'Aug 2024', blurb: 'One of Ann\'s Famous Features', length: '3:01', emoji: '🎥', yt: 'HPOINIqtne8' },
  { id: 'ann-feature-3', cat: 'clips', title: 'Phasmophobia Clip', date: 'Jun 2024', blurb: 'One of Ann\'s Famous Features', length: '0:30', emoji: '👻', yt: '4e-ZPEz5WGM' },
   
  // ---- Music Videos ----
  { id: 'thank-you', cat: 'music', title: 'Thank You Music Video', date: 'Jun 2024', blurb: 'Sqaishey\'s Song Reimagined With A New MV', length: '0:30', emoji: '💖', yt: 'qftwxeX8Z6s' },

  // ---- Recordings ----

  // ---- Other ----
  { id: '24-bday-video', cat: 'videos', title: 'HAPPY 24TH BIRTHDAY BESTIE ANN!!', date: 'Aug 2025', blurb: 'The Ultimate Birthday Experience.', length: '17:43', emoji: '🚌', yt: 'pW0-cUCRV4Y' },


  // Copy, paste, edit:
  { id: 'phasmo-film', cat: 'recordings', title: 'Phasmophobia Fashion Week: Haunted Couture', date: 'Dec 2026', blurb: 'The full thing.', length: '09:30', emoji: '👻', yt: 'cFrRMf2jCms' },
];

