import fetch from "node-fetch";
import jsdom from "jsdom";

import { writeFileSync } from "fs";

const { JSDOM } = jsdom;

const root = "https://www.spotebi.com/exercise-guide/";

function getImageFromDetailedExerciseDom(dom): string[] {
  const result = [];
  const imgQuery = dom.window.document.querySelectorAll("img");
  imgQuery.forEach((element) => {
    if (element.src.includes("illustration") || element.src.includes("pose")) {
      const imageSrc = element.src;
      result.push(imageSrc);
    }
  });
  return result;
}

function getInstructionsFromDetailedExerciseDom(dom): string {
  let result = "";
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

function getSetsFromDetailedExerciseDom(dom): string {
  let result = "";
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

function getMusclesAndEquipmentFromDetailedExerciseDom(dom): string {
  let result = "";
  const paragraphQuery = dom.window.document.querySelectorAll("p");
  paragraphQuery.forEach((element) => {
    const pText = element.textContent;
    if (pText.includes("Primary muscles")) {
      result = pText;
    }
  });
  return result;
}

function getFormFromDetailedExerciseDom(dom): string {
  let result = "";
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Proper Form And Breathing Pattern")) {
      const sibling = element.nextSibling.nextSibling;
      result = sibling?.innerHTML;
    } else if (headerText.includes("Mindfulness Practice")) {
      const sibling = element.nextSibling.nextSibling;
      result = sibling?.innerHTML;
    }
  });
  return result;
}
function getExerciseBenefitsFromDetailedExerciseDom(dom): string {
  let result = "";
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Benefits")) {
      const sibling = element.nextSibling.nextSibling;
      result = sibling?.innerHTML;
    }
  });
  return result;
}

function getRelatedExercisesFromDetailedExerciseDom(dom): string {
  let result = "";
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

function getRelatedYogaPosesFromDetailedExerciseDom(dom): string {
  let result = "";
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Related Yoga Poses")) {
      const sibling = element.nextSibling.nextSibling;
      result = `${headerText} ${sibling?.innerHTML}`;
    }
  });
  return result;
}

function getYogaRoutineFromDetailedExerciseDom(dom): string {
  let result = "";
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Preparatory, Complementary and Follow-Up Poses")) {
      const sibling = element.nextSibling.nextSibling;
      result = `${headerText} ${sibling?.innerHTML}`;
    }
  });
  return result;
}

function getContraindicationsFromDetailedExerciseDom(dom): string {
  let result = "";
  const headerQuery = dom.window.document.querySelectorAll("h2");
  headerQuery.forEach((element) => {
    const headerText = element.textContent;
    if (headerText.includes("Contraindications")) {
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
interface YogaExericse {
  images: Array<string>;
  instructions: string;
  form: string;
  benefits: string;
  related: string;
  routine: string;
  contraindications: string;
}

async function buildExerciseInfo(link: string): Promise<Exercise> {
  const detailedExercisePage = await fetch(link);
  const detailedExerciseBody = await detailedExercisePage.text();
  const dom = await new JSDOM(detailedExerciseBody);

  // Gets images from page (jpg and gif)
  const imgLinks = getImageFromDetailedExerciseDom(dom);

  // Get sets
  const sets = getSetsFromDetailedExerciseDom(dom);

  // Get instructions
  const instructions = getInstructionsFromDetailedExerciseDom(dom);

  // Get primary muscles
  const musclesAndEquipment =
    getMusclesAndEquipmentFromDetailedExerciseDom(dom);

  // Form
  const form = getFormFromDetailedExerciseDom(dom);

  // Exercise benefits
  const benefits = getExerciseBenefitsFromDetailedExerciseDom(dom);

  // Related exericses
  const related = getRelatedExercisesFromDetailedExerciseDom(dom);

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
async function buildYogaInfo(link: string): Promise<YogaExericse> {
  const detailedExercisePage = await fetch(link);
  const detailedExerciseBody = await detailedExercisePage.text();
  const dom = await new JSDOM(detailedExerciseBody);

  // Gets images from page (jpg and gif)
  const images = getImageFromDetailedExerciseDom(dom);

  // Get instructions
  const instructions = getInstructionsFromDetailedExerciseDom(dom);

  const form = getFormFromDetailedExerciseDom(dom);

  const benefits = getExerciseBenefitsFromDetailedExerciseDom(dom);

  const related = getRelatedYogaPosesFromDetailedExerciseDom(dom);
  const routine = getYogaRoutineFromDetailedExerciseDom(dom);

  const contraindications = getContraindicationsFromDetailedExerciseDom(dom);

  const exercise: YogaExericse = {
    images,
    instructions,
    routine,
    contraindications,
    form,
    benefits,
    related,
  };

  return exercise;
}

async function getExerciseGuideLinks(link: string): Promise<string[]> {
  const res = await fetch(link);
  const body = await res.text();

  const dom = await new JSDOM(body);

  const detailedExercisesLinks: string[] = [];

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

function BuildExerciseLinks(
  detailedExercisesLinks: string[],
  exerciseGuideUrl: string
): any[] {
  const exercises: Array<any> = Array<any>(0);
  detailedExercisesLinks.forEach((link) => {
    try {
      if (exerciseGuideUrl.includes("yoga")) {
        buildYogaInfo(link).then((exercise: YogaExericse) =>
          exercises.push(exercise)
        );
      } else {
        buildExerciseInfo(link).then((exercise: Exercise) =>
          exercises.push(exercise)
        );
      }
    } catch (error) {
      console.log("Error function buildExerciseInfo()", link, error);
    }
  });
  return exercises;
}

async function getExercisesFromPage(exerciseGuideUrl: string): Promise<any[]> {
  const detailedExercisesLinks: string[] = await getExerciseGuideLinks(
    exerciseGuideUrl
  );

  return BuildExerciseLinks(detailedExercisesLinks, exerciseGuideUrl);
}

const routes = [
  "yoga-poses/",
  "leg-exercises/",
  "glutes-hip-flexors-exercises/",
  "abs-obliques-exercises/",
  "biceps-exercises/",
  "triceps-exercises/",
  "shoulder-exercises/",
  "chest-exercises/",
  "back-exercises/",
];

const siteRoot: string = "https://www.spotebi.com/exercise-guide/";

async function main(): Promise<any> {
  const output = {};
  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    const url = siteRoot + route;
    try {
      // eslint-disable-next-line no-await-in-loop
      const exercises = await getExercisesFromPage(url);
      output[route] = exercises;
    } catch (error) {
      console.log(url, error);
    }
  }
  return output;
}

function getDateTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // "+ 1" becouse the 1st month is 0
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const secconds = date.getSeconds();
  const datetime = `${year}${month}${day}_${hour}${minutes}${secconds}`;
  return datetime;
}

main().then((output) => {
  const datetime: string = getDateTime();
  const filename: string = `exersize_data_${datetime}.json`;
  try {
    writeFileSync(filename, JSON.stringify(output));
  } catch (error) {
    console.log("Error writing file", error);
  }
  console.log("Finished");
});
