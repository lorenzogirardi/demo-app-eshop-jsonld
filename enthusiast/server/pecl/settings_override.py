from pecl.settings import *  # noqa: F401, F403

CATALOG_LANGUAGE_MODEL_PROVIDERS = [
    "enthusiast_model_openai.OpenAILanguageModelProvider",
]

CATALOG_EMBEDDING_PROVIDERS = [
    "enthusiast_model_openai.OpenAIEmbeddingProvider",
]

AVAILABLE_AGENTS = [
    "enthusiast_agent_product_search.ProductSearchAgent",
]
