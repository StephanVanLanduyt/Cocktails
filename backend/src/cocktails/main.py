from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from cocktails.service.deps.base import AppSettings, initialize_app
from cocktails.service.router import router

settings = AppSettings()
initialize_app(settings)
app = FastAPI(title="Cocktails")

app.include_router(router)

app.add_api_route(
    "/healthcheck",
    lambda: {"service status": "200 OK"},
    response_model=Dict,
    tags=["healthcheck"],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
