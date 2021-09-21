$(function () {
  const missingImage =
    "https://images.unsplash.com/photo-1560164959-216ab1ebb716?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80";

  async function searchShows(query) {
    let res = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);

    let showResults = res.data.map((result) => {
      let show = result.show;
      return {
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image ? show.image.medium : missingImage,
      };
    });
    return showResults;
  }

  function populateShows(showResults) {
    const $showsList = $("#shows-list");
    $showsList.empty();

    for (let show of showResults) {
      let $item = $(
        `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
           <div class="card" data-show-id="${show.id}">
           <img  class="card-img-top" src="${show.image}">
             <div class="card-body">
               <h5 class="card-title">${show.name}</h5>
               <p class="card-text">${show.summary}</p>
               <button class="btn btn-dark get-episodes">Get Episode Info!</button>
             </div>
           </div>
         </div>
        `
      );
      $showsList.append($item);
    }
  }

  $("#search-form").on("submit", async function handleSearch(evt) {
    evt.preventDefault();

    let query = $("#search-query").val();
    if (!query) return;

    $("#episodes-area").hide();

    let shows = await searchShows(query);

    populateShows(shows);
  });

  async function getEpisodes(id) {
    let response = await axios.get(
      `http://api.tvmaze.com/shows/${id}/episodes`
    );

    let episodes = response.data.map((episode) => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    }));
    return episodes;
  }

  function populateEpisodes(episodes) {
    const $episodesList = $("#episodes-list");
    $episodesList.empty();

    for (let episode of episodes) {
      let $item = $(
        `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>`
      );
      $episodesList.append($item);
    }
    $("#episodes-area").show();
  }

  const $closeModal = $(".close-modal");
  $closeModal.on("click", function () {
    $(".modal").hide();
  });

  $("#shows-list").on(
    "click",
    ".get-episodes",
    async function handleEpisodeClick(evt) {
      let showId = $(evt.target).closest(".Show").data("show-id");
      let episodes = await getEpisodes(showId);
      populateEpisodes(episodes);
    }
  );
});
