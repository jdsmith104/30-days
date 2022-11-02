
import queue
import typing
from xmlrpc.client import boolean
import requests
from bs4 import BeautifulSoup
import json
import datetime


routes = [
  "yoga-poses/",
  "leg-exercises/",
  "glutes-hip-flexors-exercises/",
  "abs-obliques-exercises/",
  "biceps-exercises/",
  "triceps-exercises/",
  "shoulder-exercises/",
  "chest-exercises/",
  "back-exercises/",
]

siteRoot = "https://www.spotebi.com/exercise-guide/"

def get_exercise_links(url) -> typing.List[str]:
  page = requests.get(url)
  
  soup = BeautifulSoup(page.content, "html.parser")

  results = soup.find_all("a")

  # Filter to remove duplicate and get list of exercises
  filtered_results = list(set([result.attrs['href'] for result in results if result.attrs.get("href") and "exercises" not in result.attrs.get("href") and "exercise-guide" in result.attrs.get("href")]))
  filtered_results.remove(siteRoot)

  return filtered_results


def get_images(soup: BeautifulSoup):
  result = []
  query = soup.find_all("img")
  for img in query:
    if "illustration" in img.attrs.get("src") or "pose" in img.attrs.get("src"):
      img_src = img.attrs.get("src")
      result.append(img_src)
  return result
    


def get_instructions(soup: BeautifulSoup):
  result = ""
  query = soup.find_all("h2")
  for element in query:
    header_text: str = element.text
    if "Instructions" in header_text:
      element_detail = element.next_sibling.next_sibling
      result = element_detail.text
      break
  return result

def get_form(soup: BeautifulSoup):
  result = ""
  query = soup.find_all("h2")
  for element in query:
    header_text: str = element.text
    if "Proper Form And Breathing Pattern" in header_text or "Mindfulness Practice" in header_text:
      sibling = element.next_sibling.next_sibling
      result = sibling.texts
      break
  return result

def get_benefits(soup: BeautifulSoup):
  result = ""
  query = soup.find_all("h2")
  for element in query:
    header_text: str = element.text
    if "Benefits" in header_text:
      sibling = element.next_sibling.next_sibling
      result = sibling.text
      break

  return result

def get_related_yoga_pose(soup: BeautifulSoup):
  result = ""
  query = soup.find_all("h2")
  for element in query:
    header_text: str = element.text
    if "Related Yoga Poses" in header_text:
      sibling = element.next_sibling.next_sibling
      result = f'{header_text} {sibling.text}'
      break
    
  return result

def get_yoga_routine(soup: BeautifulSoup):
  result = ""
  query = soup.find_all("h2")
  for element in query:
    header_text: str = element.text
    if "Preparatory, Complementary and Follow-Up Poses" in header_text:
      sibling = element.next_sibling.next_sibling
      result = f'{header_text} {sibling.text}'
      break
    

  return result

def get_yoga_contraindications(soup: BeautifulSoup):
  result = ""
  query = soup.find_all("h2")
  for element in query:
    header_text: str = element.text
    if "Contraindications" in header_text:
      sibling = element.next_sibling.next_sibling
      result = f'{header_text} {sibling.text}'
      break
  
  return result

def get_yoga_exercise_object(url:str):
  page = requests.get(url)
  soup = BeautifulSoup(page.content, "html.parser")

  images = get_images(soup)
  instructions = get_instructions(soup)
  form = get_form(soup)
  benefits = get_benefits(soup)

  related = get_related_yoga_pose(soup)
  routine = get_yoga_routine(soup)

  contraindications = get_yoga_contraindications(soup)

  return generate_yoga_object(images, instructions, form, benefits, related, routine, contraindications, url)


def getSetsFromDetailedExerciseDom(soup)-> str:
  result = ""
  query = soup.find_all("h2")

  for element in query:
    header_text: str = element.text
    if "Sets And Reps" in header_text:
      sibling = element.next_sibling.next_sibling
      result = sibling.text
      break
    

  return result


def getMusclesAndEquipmentFromDetailedExerciseDom(soup)-> str:
  result = ""
  query = soup.find_all("p")

  for element in query:
    p_text: str = element.text
    if "Primary muscles" in p_text:
      result = p_text
      break
    
  return result


def getRelatedExercisesFromDetailedExerciseDom(soup)-> str:  
  result = ""
  query = soup.find_all("h2")
  for element in query:
    header_text: str = element.text
    if "Related" in header_text and "Exercises" in header_text:
      sibling = element.next_sibling.next_sibling
      result = f'{header_text} {sibling.text}'
      break
  
  return result


def get_exercise_object(url:str):
  page = requests.get(url)
  soup = BeautifulSoup(page.content, "html.parser")

  images = get_images(soup)
  sets = getSetsFromDetailedExerciseDom(soup)
  instructions = get_instructions(soup)
  form = get_form(soup)
  benefits = get_benefits(soup)

  musclesAndEquipment = getMusclesAndEquipmentFromDetailedExerciseDom(soup)
  related = getRelatedExercisesFromDetailedExerciseDom(soup)


  return generate_exercise_object(images, instructions, form, benefits, related, sets, musclesAndEquipment, url)

def generate_yoga_object(images: typing.List[str], instructions, form, benefits, related, routine, contraindications, url):
    return {"images": images, "instructions":instructions, "form": form, "benefits": benefits, "related": related, "routine":routine, "contraindications": contraindications, "url": url}
def generate_exercise_object(images: typing.List[str], instructions, form, benefits, related, sets, musclesAndEquipment, url):
    return {"images": images, "instructions":instructions, "form": form, "benefits": benefits, "related": related, "sets":sets, "musclesAndEquipment": musclesAndEquipment, "url": url}

def get_exercises_from_urls(urls: typing.List[str], is_yoga: boolean):
  num_urls = len(urls)
  exercises: typing.List[typing.Any] = list()
  for i, url in enumerate(urls):
    if is_yoga:
      try:
        exercises.append(get_yoga_exercise_object(url))
        if (i % 5 == 0):
          print(f"Complete {i}/{num_urls} for {url}")
      except Exception as e:
        print(f"Unhandled exception adding yoga pose at {url}")
    else:
      try:
        exercises.append(get_exercise_object(url))
        if (i % 5 == 0):
          print(f"Complete {i}/{num_urls} for {url}")
      except Exception as e:
        print(f"Unhandled exception adding exercise at {url}")
  return exercises

def run():
  output = dict()
  for route in routes:
    # Iterate through all routes

    url = siteRoot + route 

    # Get exercise links
    exercise_links = get_exercise_links(url)

    # Build exercises from links
    is_yoga_link = "yoga" in url
    exercises = get_exercises_from_urls(exercise_links, is_yoga_link)

    # Build JSON object and remove end '/'
    output[route[:-1]] = exercises

  print(output)
  datetime_now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
  with open(f"exercises-{datetime_now}.json", "w") as outfile:
    json.dump(output, outfile)



if __name__ == '__main__':
  run()