import Handlebars from "handlebars";

Handlebars.registerHelper("json", (value) => {
  try {
    const jsonString = JSON.stringify(value, null, 2);
    return new Handlebars.SafeString(jsonString);
  } catch (error) {
    throw new Error(
      `Failed to serialize context to JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
});

// Add future helpers here

export default Handlebars;
