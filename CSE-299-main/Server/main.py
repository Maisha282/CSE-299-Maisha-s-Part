from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from typing import Optional
from pydantic import BaseModel
from rag import chat, get_vault_embeddings_tensors, load_vault_content
from fastapi.middleware.cors import CORSMiddleware

# Create an instance of FastAPI
app = FastAPI()

# Serve static files from the client folder
app.mount("/static", StaticFiles(directory="../client/static"), name="static")


class Message(BaseModel):
    msg: str


# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vault_content = load_vault_content()
vault_tensor_embeddings = get_vault_embeddings_tensors()


@app.post("/message/")
def send_message(message: Message):
    response = chat(message.msg, vault_tensor_embeddings, vault_content)
    return {"message": response}
