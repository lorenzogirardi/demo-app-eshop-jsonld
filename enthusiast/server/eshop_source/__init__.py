import json
import os
import urllib.request
from typing import Any

from enthusiast_common import ProductDetails, ProductSourcePlugin


class EshopProductSource(ProductSourcePlugin):
    """Imports the catalog exported by the eShop app (/api/products/dump)."""

    NAME = "eShop Product Source"

    def __init__(self, data_set_id: Any):
        super().__init__(data_set_id)
        self.url = os.environ.get("ESHOP_DUMP_URL", "http://gd-demo-app:3000/api/products/dump")
        self.token = os.environ.get("ESHOP_DUMP_TOKEN", "")

    def fetch(self) -> list[ProductDetails]:
        request = urllib.request.Request(self.url)
        if self.token:
            request.add_header("Authorization", f"Token {self.token}")
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.load(response)

        return [
            ProductDetails(
                entry_id=doc["entry_id"],
                name=doc["name"],
                slug=doc["slug"],
                sku=doc["sku"],
                description=doc["description"],
                properties=doc["properties"],
                categories=doc["categories"],
                price=doc["price"] / 100,  # dump exports cents
            )
            for doc in payload["documents"]
        ]
