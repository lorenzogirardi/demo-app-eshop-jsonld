"""Idempotent first-run setup for the Enthusiast sidecar (run through `manage.py shell`).

Creates: the API token shared with the shop, the "eShop Products" data set, the eShop product
source and the Product Search agent. Reads BOOT_TOKEN from the environment.
"""
import os

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from agent.models.agent import Agent
from catalog.models import DataSet, ProductSource

token = os.environ["BOOT_TOKEN"]
admin = get_user_model().objects.filter(is_staff=True).order_by("id").first()
if admin is None:
    raise SystemExit("No admin user yet: wait for the API to finish its first start")

Token.objects.filter(user=admin).exclude(key=token).delete()
Token.objects.get_or_create(key=token, defaults={"user": admin})

dataset, _ = DataSet.objects.get_or_create(
    name="eShop Products",
    defaults=dict(
        language_model_provider="OpenAI",
        language_model="~deepseek/deepseek-v4-flash-latest",
        embedding_provider="OpenAI",
        embedding_model="nvidia/nemotron-3-embed-1b:free",
        embedding_vector_dimensions=2048,
        embedding_chunk_size=3000,
        embedding_chunk_overlap=150,
    ),
)
dataset.users.add(admin)

source, _ = ProductSource.objects.get_or_create(
    plugin_name="eShop Product Source",
    data_set=dataset,
    defaults={"config": {"configuration_args": {}}},
)

Agent.objects.get_or_create(
    name="eShop Search Agent",
    dataset=dataset,
    defaults=dict(
        agent_type="enthusiast-agent-product-search",
        config={"tools": [{}, {}], "agent_args": {}, "prompt_input": {}, "prompt_extension": {}},
    ),
)
print(f"BOOTSTRAP_OK dataset={dataset.id} source={source.id}")
