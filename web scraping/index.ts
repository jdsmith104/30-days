import fetch from "node-fetch";
import jsdom from "jsdom";

import { writeFileSync } from "fs";

const { JSDOM } = jsdom;

const root = "https://www.spotebi.com/exercise-guide/";

async function getImageFromDetailedExerciseDom(dom): Promise<string[]> {
  const result = [];
  const imgQuery = dom.window.document.querySelectorAll("img");
  imgQuery.forEach((element) => {
    if (element.src.includes("illustration")) {
      const imageSrc = element.src;
      result.push(imageSrc);
    }
  });
  return result;
}

async function getInstructionsFromDetailedExerciseDom(dom) {
  let result;
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Instructions")) {
      const sibling = element.nextSibling.nextSibling;
      result = sibling?.innerHTML;
    }
  });
  return result;
}

async function getSetsFromDetailedExerciseDom(dom) {
  let result;
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Sets And Reps")) {
      const sibling = element.nextSibling.nextSibling;
      result = sibling?.innerHTML;
    }
  });
  return result;
}

async function getMusclesAndEquipmentFromDetailedExerciseDom(dom) {
  let result;
  const paragraphQuery = dom.window.document.querySelectorAll("p");
  paragraphQuery.forEach((element) => {
    const pText = element.textContent;
    if (pText.includes("Primary muscles")) {
      result = pText;
    }
  });
  return result;
}

async function getFormFromDetailedExerciseDom(dom) {
  let result;
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Proper Form And Breathing Pattern")) {
      const sibling = element.nextSibling.nextSibling;
      result = sibling?.innerHTML;
    }
  });
  return result;
}
async function getExerciseBenefitsFromDetailedExerciseDom(dom) {
  let result;
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Exercise Benefits")) {
      const sibling = element.nextSibling.nextSibling;
      result = sibling?.innerHTML;
    }
  });
  return result;
}

async function getRelatedExercisesFromDetailedExerciseDom(dom) {
  let result;
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Related") && headerText.includes("Exercises")) {
      const sibling = element.nextSibling.nextSibling;
      result = `${headerText} ${sibling?.innerHTML}`;
    }
  });
  return result;
}

interface Exercise {
  images: Array<string>;
  instructions: string;
  sets: string;
  musclesAndEquipment: string;
  form: string;
  benefits: string;
  related: string;
}

async function buildExerciseInfo(link: string): Promise<Exercise> {
  const detailedExercisePage = await fetch(link);
  const detailedExerciseBody = await detailedExercisePage.text();
  const dom = await new JSDOM(detailedExerciseBody);

  // Gets images from page (jpg and gif)
  const imgLinks = await getImageFromDetailedExerciseDom(dom);

  // Get sets
  const sets = await getSetsFromDetailedExerciseDom(dom);

  // Get instructions
  const instructions = await getInstructionsFromDetailedExerciseDom(dom);

  // Get primary muscles
  const musclesAndEquipment =
    await getMusclesAndEquipmentFromDetailedExerciseDom(dom);

  // Form
  const form = await getFormFromDetailedExerciseDom(dom);

  // Exercise benefits
  const benefits = await getExerciseBenefitsFromDetailedExerciseDom(dom);

  // Related exericses
  const related = await getRelatedExercisesFromDetailedExerciseDom(dom);

  const exercise: Exercise = {
    images: imgLinks,
    instructions,
    sets,
    musclesAndEquipment,
    form,
    benefits,
    related,
  };

  return exercise;
}

async function getExerciseGuideLinks(link: string) {
  const res = await fetch(link);
  const body = await res.text();

  const dom = await new JSDOM(body);

  const detailedExercisesLinks = [];

  const query = dom.window.document.querySelectorAll("a");
  query.forEach((element) => {
    const { href } = element;
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

async function getPageContent(url) {
  const detailedExercisesLinks = await getExerciseGuideLinks(url);
  const exercises: Array<Exercise> = Array<Exercise>(0);
  const exercise = await buildExerciseInfo(detailedExercisesLinks[2]);
  exercises.push(exercise);

  return exercises;
}

const routes = [
  "leg-exercises/",
  // "glutes-hip-flexors-exercises/",
  // "abs-obliques-exercises/",
  // "biceps-exercises/",
  // "triceps-exercises/",
  // "shoulder-exercises/",
  // "chest-exercises/",
  // "back-exercises/",
  // "yoga-poses/",
];

const siteRoot: string = "https://www.spotebi.com/exercise-guide/";

async function main(): Promise<any> {
  const output = {};
  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    const url = siteRoot + route;
    try {
      // eslint-disable-next-line no-await-in-loop
      const exercises = await getPageContent(url);
      output[route] = exercises;
    } catch (error) {
      console.log(url, error);
    }
  }
  return output;
}

main().then((output) => {
  writeFileSync("test.json", JSON.stringify(output));
});
