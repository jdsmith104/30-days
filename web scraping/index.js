import fetch from "node-fetch";
import jsdom from "jsdom";

const { JSDOM } = jsdom;

const root = "https://www.spotebi.com/exercise-guide/";

async function getPageContent() {
  const res = await fetch(
    "https://www.spotebi.com/exercise-guide/leg-exercises/"
  );
  const body = await res.text();

  const dom = await new JSDOM(body);
  const imgQuery = dom.window.document.querySelectorAll("img");
  imgQuery.forEach((element) => {
    if (element.src.includes("illustration")) {
      const imageSrc = element.src.slice(0, -12) + ".jpg";
      console.log(imageSrc);
    }
  });

  const detailedExercisesLinks = Array();

  const query = dom.window.document.querySelectorAll("a");
  query.forEach((element) => {
    const href = element.href;
    if (href.includes("exercise-guide") && href !== root) {
      const detailedLink = href;
      detailedExercisesLinks.push(detailedLink);
    }
  });

  const res1 = await fetch(detailedExercisesLinks[0]);
  const body1 = await res1.text();

  // Gets image from page
  const dom1 = await new JSDOM(body1);
  const imgQuery1 = dom1.window.document.querySelectorAll("img");
  imgQuery1.forEach((element) => {
    if (element.src.includes("illustration")) {
      const imageSrc = element.src.slice(0, -12) + ".jpg";
      console.log(imageSrc);
    }
  });

  // Get gif

  // Get sets

  // Get instructions

  // Get primary muscles

  // Form
}

getPageContent();
