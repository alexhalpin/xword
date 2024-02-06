export function autoMini(logDetails) {
  console.log("Mini Request Detected");

  const tabId = logDetails.tabId;
  const rawResp = logDetails.requestBody.raw[0].bytes;
  const jsonData = JSON.parse(new TextDecoder().decode(rawResp));
  handleRequest(jsonData, tabId);
}

function handleRequest(jsonData, tabId) {
  const solved = jsonData.commits[0].solved;

  if (!solved) {
    return;
  }

  var puzzleDate;
  var prevDate;

  chrome.tabs
    .get(tabId)
    .then((tab) => {
      const url = tab.url;
      puzzleDate = getDateFromUrl(url);

      console.log(
        "Solved Puzzle: ",
        `${
          puzzleDate.getMonth() + 1
        }/${puzzleDate.getDate()}/${puzzleDate.getFullYear()}`
      );

      prevDate = getPreviousDate(puzzleDate);
      return getUrlFromDate(prevDate);
    })
    .then((prevUrl) => {
      return chrome.tabs.update(
        tabId, // optional integer
        { active: true, url: prevUrl }
      );
    })
    .then((i) =>
      console.log(
        "Opened Previous Puzzle: ",
        `${
          prevDate.getMonth() + 1
        }/${prevDate.getDate()}/${prevDate.getFullYear()}`
      )
    )
    .catch((e) => {
      console.error("Could not open previous puzzle: ", e);
    });
}

function getPreviousDate(date) {
  let prevDate = new Date(date);
  prevDate.setDate(date.getDate() - 1);
  return prevDate;
}

function getDateFromUrl(url) {
  const regex = /.*\/mini\/([0-9]{4})\/([0-9]{1,2})\/([0-9]{1,2})/;
  const match = url.match(regex);

  return new Date(match[1], match[2] - 1, match[3]);
}

function getUrlFromDate(date) {
  const miniBaseUrl = "https://www.nytimes.com/crosswords/game/mini/";
  const url =
    miniBaseUrl +
    `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  return url;
}
