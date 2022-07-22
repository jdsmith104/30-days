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
  getSetsFromDetailedExerciseDom(dom);

  // Get instructions
  getInstructionsFromDetailedExerciseDom(dom);

  // Get primary muscles
  getMusclesAndEquipmentFromDetailedExerciseDom(dom);

  // Form
  getFormFromDetailedExerciseDom(dom);

  // Exercise benefits
  getExerciseBenefitsFromDetailedExerciseDom(dom);

  // Related exericses
  getRelatedExercisesFromDetailedExerciseDom(dom);
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
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Instructions")) {
      const sibling = element.nextSibling.nextSibling;
      console.log(sibling?.innerHTML);
    }
  });
}

async function getSetsFromDetailedExerciseDom(dom) {
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Sets And Reps")) {
      const sibling = element.nextSibling.nextSibling;
      console.log(sibling?.innerHTML);
    }
  });
}

async function getMusclesAndEquipmentFromDetailedExerciseDom(dom) {
  const paragraphQuery = dom.window.document.querySelectorAll("p");
  paragraphQuery.forEach((element) => {
    const pText = element.textContent;
    if (pText.includes("Primary muscles")) {
      console.log(pText);
    }
  });
}

async function getFormFromDetailedExerciseDom(dom) {
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Proper Form And Breathing Pattern")) {
      const sibling = element.nextSibling.nextSibling;
      console.log(sibling?.innerHTML);
    }
  });
}
async function getExerciseBenefitsFromDetailedExerciseDom(dom) {
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Exercise Benefits")) {
      const sibling = element.nextSibling.nextSibling;
      console.log(sibling?.innerHTML);
    }
  });
}

async function getRelatedExercisesFromDetailedExerciseDom(dom) {
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Related") && headerText.includes("Exercises")) {
      const sibling = element.nextSibling.nextSibling;
      console.log(headerText, sibling?.innerHTML);
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
