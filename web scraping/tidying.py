from collections import namedtuple
import json
import datetime
import typing

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
        processed_exercises = [self.process_exercise(exercise) for exercise in exercises]
        output_data[self.process_category(category)] = processed_exercises
    
    datetime_now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    # with open(f"exercises-processed-{datetime_now}.json", "w") as outfile:
    #   json.dump(output_data, outfile)

    print(output_data[self.process_category("leg-exercises")][0])
    print(output_data[self.process_category("yoga-poses")][0])

  def process_exercise(self, exercise: typing.Dict):
    exercise_next: ExtendedExercise = {}

    exercise_next = self.change_url_to_name(exercise)
    exercise_next = self.format_instructions(exercise)
    exercise_next = self.download_and_label_images(exercise)
    exercise_next = self.format_related(exercise)
    exercise_next = self.format_routine(exercise)
    exercise_next = self.format_contraindications(exercise)
    exercise_next = self.format_benefits(exercise)
    exercise_next = self.format_sets(exercise)
    exercise_next = self.format_equipment(exercise)

    return exercise_next

  def clean_string(self, inp: str) -> str:
    return inp

  def process_category(self, category: str) -> str:
    return category.replace("-", " ")

  def change_url_to_name(self, exercise: ExtendedExercise) -> ExtendedExercise:
    url = exercise.get("url")
    if url:
      name = url.removeprefix("https://www.spotebi.com/exercise-guide/")[:-1].replace("-", " ")
      exercise["name"] = name
    return exercise

  def format_instructions(self, exercise) -> ExtendedExercise:
    return exercise

  def download_and_label_images(self, exercise) -> ExtendedExercise:
    return exercise

  def format_related(self, exercise) -> ExtendedExercise:
    return exercise

  def format_routine(self, exercise) -> ExtendedExercise:
    return exercise

  def format_contraindications(self, exercise) -> ExtendedExercise:
    return exercise

  def format_benefits(self, exercise) -> ExtendedExercise:
    return exercise

  def format_sets(self, exercise) -> ExtendedExercise:
    return exercise

  def format_equipment(self, exercise) -> ExtendedExercise:
    return exercise

  def format_contraindications(self, exercise) -> ExtendedExercise:
    return exercise

  def format_routine(self, exercise) -> ExtendedExercise:
    return exercise



if __name__ == '__main__':
  tider = JSONTidier("demo.json")