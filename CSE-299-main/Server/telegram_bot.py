import os
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
import requests

# Your Telegram Bot Token
TELEGRAM_BOT_TOKEN = "7979113229:AAFK6Z_Cs69QSwWItP6VDZjTcMWGf8XUv3c"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Hello! I am your NSU Code of Conduct assistant.")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_message = update.message.text
    response = requests.post(
        "http://127.0.0.1:8000/message/", json={"msg": user_message})
    answer = response.json().get("message", "Sorry, I didn't understand that.")
    await update.message.reply_text(answer)


def main():
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND, handle_message))

    application.run_polling()


if __name__ == '__main__':
    main()
