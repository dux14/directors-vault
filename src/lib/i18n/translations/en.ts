/* ============================================
 * English translations
 * ============================================ */

const en: Record<string, string> = {
  // Navigation
  "nav.ranking": "Ranking",
  "nav.search": "Search",
  "nav.watchlist": "Watchlist",
  "nav.collections": "Collections",
  "nav.profile": "Profile",

  // Home
  "home.myRanking": "My Ranking",
  "home.moviesRated": "{count} movies rated",
  "home.startRating": "Start rating movies to see your ranking",
  "home.trending": "Trending this week",
  "home.myTop": "My Top Movies",
  "home.emptyTitle": "Your ranking is empty",
  "home.emptyDesc": "Search for movies you've watched, mark them as seen and give them your personal rating.",
  "home.nowPlaying": "Now Playing",
  "home.topRated": "All-Time Best",
  "home.forYou": "For You",

  // Search
  "search.placeholder.movies": "Search movie...",
  "search.placeholder.people": "Search actor or director...",
  "search.tab.movies": "Movies",
  "search.tab.people": "People",
  "search.results": "{count} result{s}",
  "search.people": "{count} person{s}",
  "search.popularToday": "Popular today",
  "search.noResults": "No results",
  "search.noResultsFor": "No {type} found for \"{query}\"",
  "search.movies": "movies",
  "search.persons": "people",

  // Movie Detail
  "movie.synopsis": "Synopsis",
  "movie.noSynopsis": "No synopsis available.",
  "movie.director": "Director",
  "movie.cast": "Cast",
  "movie.recommended": "Recommended",
  "movie.rateTitle": "Rate this movie",
  "movie.watched": "Watched",
  "movie.wantToWatch": "Want to Watch",
  "movie.notInterested": "No",
  "movie.pending": "Pending",
  "movie.notInterestedStatus": "Not interested",
  "movie.editRating": "Edit Rating",
  "movie.rate": "Rate",
  "movie.watchedCount": "Watched {count} {unit}",
  "movie.time": "time",
  "movie.times": "times",
  "movie.removeFromList": "Remove from my list",
  "movie.cancel": "Cancel",
  "movie.save": "Save",
  "movie.saving": "Saving...",

  // Watchlist
  "watchlist.title": "Want to Watch",
  "watchlist.count": "{count} movie{s} in your list",
  "watchlist.empty": "Your watchlist is empty",
  "watchlist.emptyTitle": "Nothing pending",
  "watchlist.emptyDesc": "Search for movies and mark them as \"Want to Watch\" to add them here.",

  // Collections
  "collections.title": "Collections",
  "collections.subtitle": "Organize your movies by theme",
  "collections.new": "New Collection",
  "collections.create": "Create",
  "collections.creating": "Creating...",
  "collections.namePlaceholder": "Collection name",
  "collections.descPlaceholder": "Description (optional)",
  "collections.emptyTitle": "No collections",
  "collections.emptyDesc": "Create collections to organize movies by director, saga, genre or anything you want.",
  "collections.deleteConfirm": "Delete this collection?",
  "collections.type.custom": "Custom",
  "collections.type.saga": "Saga",
  "collections.type.director": "Director",
  "collections.type.actor": "Actor",
  "collections.type.genre": "Genre",



  // Profile
  "profile.title": "My Profile",
  "profile.watched": "Watched",
  "profile.pending": "Pending",
  "profile.average": "Average",
  "profile.notInterested": "Not interested",
  "profile.signOut": "Sign Out",
  "profile.user": "User",

  // Person
  "person.biography": "Biography",
  "person.filmography": "Filmography",
  "person.all": "All",
  "person.asActor": "Actor",
  "person.asDirector": "Director",
  "person.asActorCount": "as actor",
  "person.asDirectorCount": "as director",
  "person.showMore": "Show more",
  "person.showLess": "Show less",
  "person.noMovies": "No movies for this filter",
  "person.exportCollection": "Export as collection",
  "person.exporting": "Exporting...",
  "person.exportSuccess": "Collection created!",

  // Social
  "social.title": "Social",
  "social.friendCode": "Your friend code",
  "social.shareTip": "Share this code so others can add you",
  "social.addFriend": "Add friend",
  "social.email": "Email",
  "social.code": "Code",
  "social.emailPlaceholder": "email@example.com",
  "social.codePlaceholder": "Friend code",
  "social.notFoundEmail": "No user found with that email",
  "social.notFoundCode": "Friend code not found",
  "social.searchError": "Search error",
  "social.add": "Add",
  "social.requests": "Requests",
  "social.friends": "Friends",
  "social.sent": "Sent",
  "social.pendingAccept": "Pending acceptance",
  "social.noFriends": "No friends yet",
  "social.noFriendsDesc": "Search by email or share your friend code.",
  "social.removeFriend": "Remove this friend?",
  "social.watched": "Watched",
  "social.average": "Average",
  "social.topMovies": "Top Movies",
  "social.collectionInvites": "Collection invitations",
  "social.accept": "Accept",
  "social.decline": "Decline",
  "social.invitedBy": "Invited by {name}",

  // Movie — add to collection
  "movie.addToCollection": "Add to collection",
  "movie.selectCollection": "Select collection",
  "movie.noCollections": "You don't have collections yet",
  "movie.added": "Added",

  // Collection Detail
  "collectionDetail.back": "Collections",
  "collectionDetail.empty": "Empty collection",
  "collectionDetail.emptyDesc": "Search for movies and add them from the movie detail page.",
  "collectionDetail.members": "Members",
  "collectionDetail.invite": "Invite friend",
  "collectionDetail.owner": "Owner",
  "collectionDetail.member": "Member",
  "collectionDetail.avgRating": "Average",
  "collectionDetail.shared": "Shared",

  // Rating grades
  "rating.S": "Masterpiece",
  "rating.Aplus": "Excellent",
  "rating.A": "Very Good",
  "rating.B": "Good",
  "rating.C": "Average",
  "rating.D": "Below Average",
  "rating.E": "Bad",
  "rating.F": "Terrible",

  // General
  "general.cancel": "Cancel",
  "general.save": "Save",
  "general.delete": "Delete",
  "general.loading": "Loading...",
  "general.language": "Language",
  "general.spanish": "Spanish",
  "general.english": "English",
};

export default en;
