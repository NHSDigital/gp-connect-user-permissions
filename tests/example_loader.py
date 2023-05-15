import os
import yaml

current_directory = os.path.dirname(os.path.realpath(__file__))


def load_example(path: str):
    with open(f"{current_directory}/../specification/components/examples/{path}") as f:
        if path.endswith("yml") or path.endswith("yaml"):
            return yaml.safe_load(f)
        else:
            return f.read().strip()
