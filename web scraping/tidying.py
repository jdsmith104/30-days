from collections import namedtuple
import json
import datetime
import typing
import re
import requests
from pathlib import Path
import traceback


DL_IMG = True
ExtendedExercise = namedtuple

ExtendedExercise = typing.TypedDict('Exercise', {'images': typing.List[str], 'instructions': str, "form": str, "benefits": str, "related": str, "sets": str, "musclesAndEquipment": str, "url": str, "routine": str, "contraindications": str})

class JSONTidier:
  def __init__(self, filename: str) -> None:
    with open(filename, 'r') as f:
      data: typing.Dict[str, typing.List] = json.load(f)

    categories = data.keys()

    output_data: typing.Dict[str, typing.List] = {}

    for category in categories:
      exercises = data.get(category)

      # Verfiy not null
      if exercises:
        processed_category = self.process_category(category)
        print(f"Processing category: {processed_category}")

        processed_exercises = [self.process_exercise(exercise, processed_category) for exercise in exercises]
        output_data[processed_category] = processed_exercises
      print("Finished category")
    
    datetime_now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    with open(f"exercises-processed-{datetime_now}.json", "w") as outfile:
      json.dump(output_data, outfile)
      print("Finished")


  def process_exercise(self, exercise: typing.Dict, category: str):
    exercise_next: ExtendedExercise = {}
    try:
      exercise_next = self.change_url_to_name(exercise)
      exercise_next = self.format_instructions(exercise)
      exercise_next = self.process_images(exercise, category)
      exercise_next = self.format_related(exercise)
      exercise_next = self.format_routine(exercise)
      exercise_next = self.format_contraindications(exercise)
      exercise_next = self.format_benefits(exercise)
      exercise_next = self.format_sets(exercise)
      exercise_next = self.format_equipment(exercise)
    except Exception as e:
      traceback.print_exc()
      print("Problem with:\n", exercise)
      print(e)
    return exercise_next

  def clean_string(self, inp: str) -> str:
    return inp

  def process_category(self, category: str) -> str:
    return category.replace("-", " ")

  def change_url_to_name(self, exercise: ExtendedExercise) -> ExtendedExercise:
    """Use the url parameter the create a name and add that to the exercise

    Args:
        exercise (ExtendedExercise): object

    Returns:
        ExtendedExercise: modified object
    """
    url = exercise.get("url")
    if url:
      name = url.removeprefix("https://www.spotebi.com/exercise-guide/")[:-1].replace("-", " ")
      exercise["name"] = name
    return exercise

  def format_instructions(self, exercise: ExtendedExercise) -> ExtendedExercise:
    key = "instructions"
    instructions = exercise.get(key)
    matches = re.findall("\d.\s([^.]*)", instructions)
    exercise[key] = matches
    return exercise

  def process_images(self, exercise: ExtendedExercise, category: str) -> ExtendedExercise:
    """Download and label images. Must be called after change_url_to_name

    Args:
        exercise (ExtendedExercise): _description_
        category (str): _description_

    Returns:
        ExtendedExercise: _description_
    """
    filename = category+"_"+ exercise.get("name")
    filename = filename.replace(" ", "_")
    for i, url in enumerate(exercise.get("images")):
      match = re.findall("\.(.*)", url[-5:])
      file_extension = match[0]
      try:
        # Create file path in folder images and building the filename and extension
        path = f"images/{filename}_{str(i)}.{file_extension}"
        self.download_and_save_image(url=url, filename=path)
      except Exception as e:
        print(e, filename)

    return exercise

  def format_related(self, exercise: ExtendedExercise) -> ExtendedExercise:
    """Format related exercises

    Args:
        exercise (ExtendedExercise): object

    Returns:
        ExtendedExercise: modified object
    """
    key = "related"
    related = exercise.get(key)
    if related:
      related = related.split(":")[1]
      matches = re.split("([A-Z])", related)[1:]

      processed_related = []
      for i in range(0,len(matches), 2):
        related_exercise = matches[i]+ matches[i+1]
        processed_related.append(related_exercise.lower())
      exercise[key] = processed_related

    return exercise

  def format_routine(self, exercise: ExtendedExercise) -> ExtendedExercise:
    """Format the routine parameter (yoga only)

    Args:
        exercise (ExtendedExercise): _description_

    Returns:
        ExtendedExercise: _description_
    """
    key = "routine"
    routine = exercise.get(key)
    if routine:
      text  = routine.removeprefix("Preparatory, Complementary and Follow-Up Poses ")
      exercise[key] = text
    return exercise

  def format_contraindications(self, exercise: ExtendedExercise) -> ExtendedExercise:
    """Format contraindications (yoga only)

    Args:
        exercise (ExtendedExercise): object

    Returns:
        ExtendedExercise: modified object
    """
    key = "contraindications"
    routine = exercise.get(key)
    if routine:
      text  = routine.removeprefix("Contraindications ")
      exercise[key] = text
    return exercise

  def format_benefits(self, exercise: ExtendedExercise) -> ExtendedExercise:
    """Format benefits (currently not required)

    Args:
        exercise (ExtendedExercise): object

    Returns:
        ExtendedExercise: modified object
    """
    return exercise

  def format_sets(self, exercise: ExtendedExercise) -> ExtendedExercise:
    """Format sets (currently not required)

    Args:
        exercise (ExtendedExercise): object

    Returns:
        ExtendedExercise: modified object
    """
    return exercise

  def format_equipment(self, exercise: ExtendedExercise) -> ExtendedExercise:
    """Format equipment (exercise only)

    Args:
        exercise (ExtendedExercise): object

    Returns:
        ExtendedExercise: modified object
    """
    key = "musclesAndEquipment"
    related = exercise.get(key)
    if related:
      related = related.replace(": ", "")
      # related = related.replace(" / ", "")
      related_list = self.separate_string_into_list_by_capital(related)
      related_dict = dict()
      for i in range(0, len(related_list), 2):
        related_dict[related_list[i]] = related_list[i+1].lower().split(", ")
        exercise[key] = related_dict
    return exercise


  def separate_string_into_list_by_capital(self, inp: str) -> typing.List[str]:
    # Masking tape to solve this specific problem
    parsed_inp = inp.replace("Dumbbell / Kettlebell", "Dumbbell/kettlebell")
    matches = re.split("([A-Z])", parsed_inp)[1:]

    processed_related = []
    for i in range(0,len(matches), 2):
      processed_related.append(matches[i]+ matches[i+1])

    return processed_related

  def download_and_save_image(self, url: str, filename: str):
    """Download image from specified url and save as filename

    Args:
        image_url (str): the url for the image
        filename (str): the filename to save the image under (including the file type)
    """
    file: Path = Path(filename)
    if not file.exists() and DL_IMG:
      image_data = requests.get(url).content
      with open(filename, 'wb') as handler:
          handler.write(image_data)



if __name__ == '__main__':
  DL_IMG = False
  tider = JSONTidier("exercises-20221102_101508.json")