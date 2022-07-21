import fetch from "node-fetch";
import jsdom from "jsdom";

const { JSDOM } = jsdom;

const root = "https://www.spotebi.com/exercise-guide/";

async function buildExerciseInfo(link) {
  const detailedExercisePage = await fetch(link);
  const detailedExerciseBody = await detailedExercisePage.text();

  // Gets images from page (jpg and gif)
  const dom = await new JSDOM(detailedExerciseBody);
  getImageFromDetailedExerciseDom(dom);

  // Get sets

  // Get instructions
  getInstructionsFromDetailedExerciseDom(dom);

  // Get primary muscles

  // Form
}

async function getImageFromDetailedExerciseDom(dom) {
  const imgQuery = dom.window.document.querySelectorAll("img");
  imgQuery.forEach((element) => {
    if (element.src.includes("illustration")) {
      const imageSrc = element.src;
      console.log(imageSrc);
    }
  });
}

async function getInstructionsFromDetailedExerciseDom(dom) {
  const paragraphQuery = dom.window.document.querySelectorAll("p");
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Instructions")) {
      const sibling = element.nextSibling.nextSibling;
      console.log(sibling?.innerHTML);
    }
  });
}

async function getExerciseGuideLinks(link) {
  const res = await fetch(link);
  const body = await res.text();

  const dom = await new JSDOM(body);

  const detailedExercisesLinks = Array();

  const query = dom.window.document.querySelectorAll("a");
  query.forEach((element) => {
    const href = element.href;
    if (
      href.includes("exercise-guide") &&
      href !== root &&
      !href.includes("exercises")
    ) {
      const detailedLink = href;
      detailedExercisesLinks.push(detailedLink);
    }
  });

  return detailedExercisesLinks;
}

async function getPageContent() {
  const detailedExercisesLinks = await getExerciseGuideLinks(
    "https://www.spotebi.com/exercise-guide/leg-exercises/"
  );

  buildExerciseInfo(detailedExercisesLinks[2]);
}

getPageContent();
