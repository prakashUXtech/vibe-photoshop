Generate images

The Gemini API supports image generation using Gemini 2.0 Flash Experimental and using Imagen 3. This guide helps you get started with both models.

Generate images using Gemini
Gemini 2.0 Flash Experimental supports the ability to output text and inline images. This lets you use Gemini to conversationally edit images or generate outputs with interwoven text (for example, generating a blog post with text and images in a single turn). All generated images include a SynthID watermark, and images in Google AI Studio include a visible watermark as well.

Note: Make sure to include responseModalities: ["Text", "Image"] in your generation configuration for text and image output with gemini-2.0-flash-exp`.
The following example shows how to use Gemini 2.0 to generate text-and-image output:

Python
Node.js
REST

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64

client = genai.Client()

contents = ('Hi, can you create a 3d rendered image of a pig '
            'with wings and a top hat flying over a happy '
            'futuristic scifi city with lots of greenery?')

response = client.models.generate_content(
    model="models/gemini-2.0-flash-exp",
    contents=contents,
    config=types.GenerateContentConfig(response_modalities=['Text', 'Image'])
)

for part in response.candidates[0].content.parts:
  if part.text is not None:
    print(part.text)
  elif part.inline_data is not None:
    image = Image.open(BytesIO(base64.b64decode(part.inline_data.data)))
    image.save('gemini-native-image.png')
    image.show()
The code sample should output an image and might output text as well.

AI-generated image of a fantastical flying pig

Depending on the prompt and context, Gemini will generate content in different modes (text to image, text to image and text, etc.). Here are some examples:

Text to image
Example prompt: "Generate an image of the Eiffel tower with fireworks in the background."
Text to image(s) and text (interleaved)
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved)
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Image editing (text and image to image)
Example prompt: "Edit this image to make it look like a cartoon"
Example prompt: [image of a cat] + [image of a pillow] + "Create a cross stitch of my cat on this pillow."
Multi-turn image editing (chat)
Example prompts: [upload an image of a blue car.] "Turn this car into a convertible." "Now change the color to yellow."
Limitations
For best performance, use the following languages: EN, es-MX, ja-JP, zh-CN, hi-IN.
Image generation does not support audio or video inputs.
Image generation may not always trigger:
The model may output text only. Try asking for image outputs explicitly (e.g. "generate an image", "provide images as you go along", "update the image").
The model may stop generating partway through. Try again or try a different prompt.
When generating text for an image, Gemini works best if you first generate the text and then ask for an image with the text.
Choose a model
Which model should you use to generate images? It depends on your use case.

Gemini 2.0 is best for producing contextually relevant images, blending text + images, incorporating world knowledge, and reasoning about images. You can use it to create accurate, contextually relevant visuals embedded in long text sequences. You can also edit images conversationally, using natural language, while maintaining context throughout the conversation.

If image quality is your top priority, then Imagen 3 is a better choice. Imagen 3 excels at photorealism, artistic detail, and specific artistic styles like impressionism or anime. Imagen 3 is also a good choice for specialized image editing tasks like updating product backgrounds, upscaling images, and infusing branding and style into visuals. You can use Imagen 3 to create logos or other branded product designs.

Generate images using Imagen 3
The Gemini API provides access to Imagen 3, Google's highest quality text-to-image model, featuring a number of new and improved capabilities. Imagen 3 can do the following:

Generate images with better detail, richer lighting, and fewer distracting artifacts than previous models
Understand prompts written in natural language
Generate images in a wide range of formats and styles
Render text more effectively than previous models
Note: Imagen 3 is only available on the Paid Tier. See the Pricing page for more info.
Imagen example
This section shows you how to instantiate an Imagen model and generate images.

After you install the Google Gen AI SDK, you can use the following code to generate images:


from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client(api_key='GEMINI_API_KEY')

response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt='Fuzzy bunnies in my kitchen',
    config=types.GenerateImagesConfig(
        number_of_images= 4,
    )
)
for generated_image in response.generated_images:
  image = Image.open(BytesIO(generated_image.image.image_bytes))
  image.show()
The code sample should output four images similar to this one:

AI-generated image of two fuzzy bunnies in the kitchen

You can also try out the Getting Started with Imagen notebook in the Gemini Cookbook.

Imagen model parameters
Note: For the initial GA launch of Imagen 3, safety filters are not configurable.
The following parameters are available for generate_images():

prompt: The text prompt for the image.
number_of_images: The number of images to generate, from 1 to 4 (inclusive). The default is 4.
aspect_ratio: Changes the aspect ratio of the generated image. Supported values are "1:1", "3:4", "4:3", "9:16", and "16:9". The default is "1:1".
safety_filter_level: Adds a filter level to safety filtering. The following values are valid:
"BLOCK_LOW_AND_ABOVE": Block when the probability score or the severity score is LOW, MEDIUM, or HIGH.
"BLOCK_MEDIUM_AND_ABOVE": Block when the probability score or the severity score is MEDIUM or HIGH.
"BLOCK_ONLY_HIGH": Block when the probability score or the severity score is HIGH.
person_generation: Allow the model to generate images of people. The following values are supported:
"DONT_ALLOW": Block generation of images of people.
"ALLOW_ADULT": Generate images of adults, but not children. This is the default.
A non-visible digital SynthID watermark is always added to generated images.

Text prompt language
The following input text prompt languages are supported:

English (en)
What's next
To learn more about prompt writing for Imagen, see the Imagen prompt guide.
To learn more about Gemini 2.0 models, see Gemini models and Experimental models.