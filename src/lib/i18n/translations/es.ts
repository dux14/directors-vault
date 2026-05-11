/* ============================================
 * Spanish translations
 * ============================================ */

const es = {
  // Navigation
  "nav.ranking": "Ranking",
  "nav.search": "Buscar",
  "nav.watchlist": "Pendientes",
  "nav.collections": "Colecciones",
  "nav.profile": "Perfil",

  // Home
  "home.myRanking": "Mi Ranking",
  "home.moviesRated": "{count} películas calificadas",
  "home.startRating": "Empieza a calificar películas para ver tu ranking",
  "home.trending": "Trending esta semana",
  "home.myTop": "Mi Top Películas",
  "home.emptyTitle": "Tu ranking está vacío",
  "home.emptyDesc": "Busca películas que hayas visto, márcalas como vistas y dales tu calificación personal.",
  "home.nowPlaying": "Estrenos Recientes",
  "home.topRated": "Mejores de la Historia",
  "home.forYou": "Para Ti",

  // Search
  "search.placeholder.movies": "Buscar película...",
  "search.placeholder.people": "Buscar actor o director...",
  "search.tab.movies": "Películas",
  "search.tab.people": "Personas",
  "search.results": "{count} resultado{s}",
  "search.people": "{count} persona{s}",
  "search.popularToday": "Popular hoy",
  "search.noResults": "Sin resultados",
  "search.noResultsFor": "No encontramos {type} para \"{query}\"",
  "search.movies": "películas",
  "search.persons": "personas",

  // Movie Detail
  "movie.synopsis": "Sinopsis",
  "movie.noSynopsis": "Sin sinopsis disponible.",
  "movie.director": "Director",
  "movie.cast": "Reparto",
  "movie.recommended": "Recomendadas",
  "movie.rateTitle": "Califica esta película",
  "movie.watched": "Vista",
  "movie.wantToWatch": "Quiero Ver",
  "movie.notInterested": "No",
  "movie.pending": "Pendiente",
  "movie.notInterestedStatus": "No interesada",
  "movie.editRating": "Editar Rating",
  "movie.rate": "Calificar",
  "movie.watchedCount": "Visto {count} {unit}",
  "movie.time": "vez",
  "movie.times": "veces",
  "movie.removeFromList": "Quitar de mi lista",
  "movie.cancel": "Cancelar",
  "movie.save": "Guardar",
  "movie.saving": "Guardando...",

  // Watchlist
  "watchlist.title": "Quiero Ver",
  "watchlist.count": "{count} película{s} en tu lista",
  "watchlist.empty": "Tu lista de pendientes está vacía",
  "watchlist.emptyTitle": "Nada pendiente",
  "watchlist.emptyDesc": "Busca películas y márcalas como \"Quiero Ver\" para agregarlas aquí.",

  // Collections
  "collections.title": "Colecciones",
  "collections.subtitle": "Organiza tus películas por tema",
  "collections.new": "Nueva Colección",
  "collections.create": "Crear",
  "collections.creating": "Creando...",
  "collections.namePlaceholder": "Nombre de la colección",
  "collections.descPlaceholder": "Descripción (opcional)",
  "collections.emptyTitle": "Sin colecciones",
  "collections.emptyDesc": "Crea colecciones para organizar películas por director, saga, género o lo que quieras.",
  "collections.deleteConfirm": "¿Eliminar esta colección?",
  "collections.type.custom": "Personalizada",
  "collections.type.saga": "Saga",
  "collections.type.director": "Director",
  "collections.type.actor": "Actor",
  "collections.type.genre": "Género",

  // Profile
  "profile.title": "Mi Perfil",
  "profile.watched": "Vistas",
  "profile.pending": "Pendientes",
  "profile.average": "Promedio",
  "profile.notInterested": "No interesadas",
  "profile.signOut": "Cerrar Sesión",
  "profile.user": "Usuario",

  // Person
  "person.biography": "Biografía",
  "person.filmography": "Filmografía",
  "person.all": "Todas",
  "person.asActor": "Actor",
  "person.asDirector": "Director",
  "person.asActorCount": "como actor",
  "person.asDirectorCount": "como director",
  "person.showMore": "Ver más",
  "person.showLess": "Ver menos",
  "person.noMovies": "Sin películas para este filtro",

  // Rating grades
  "rating.S": "Obra maestra",
  "rating.Aplus": "Excelente",
  "rating.A": "Muy buena",
  "rating.B": "Buena",
  "rating.C": "Regular",
  "rating.D": "Mediocre",
  "rating.E": "Mala",
  "rating.F": "Terrible",

  // General
  "general.cancel": "Cancelar",
  "general.save": "Guardar",
  "general.delete": "Eliminar",
  "general.loading": "Cargando...",
  "general.language": "Idioma",
  "general.spanish": "Español",
  "general.english": "Inglés",
} as const;

export type TranslationKey = keyof typeof es;
export default es;
