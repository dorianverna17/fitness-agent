from openai import OpenAI
client = OpenAI()

# export OPENAI_API_KEY="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"

response = client.responses.create(
    model="gpt-5.5",
    input="Write a one-sentence bedtime story about a unicorn."
)

print(response.output_text)
