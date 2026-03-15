const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDJcJGPWLLsc9tV15UmO2aTtouZ_1g7294JCyBYssqyyyxzxCTHcKWFiUKWaXa1s81ng/exec";
const SHARED_SECRET = "SuPeRsEcReTkEy";

const columns = [
  "title",
  "category",
  "subcategory",
  "description",
  "short_description",
  "tags",
  "review_summary",
  "review_keywords",
  "rating_estimate",
  "review_count_estimate",
  "address",
  "city",
  "state",
  "zip",
  "latitude",
  "longitude",
  "website",
  "phone",
  "image",
  "popularity_score",
  "price_level",
  "family_friendly",
  "outdoor",
  "seasonal_tags",
  "SUNDAYhours",
  "MONDAYhours",
  "TUESDAYhours",
  "WEDNESDAYhours",
  "THURSDAYhours",
  "FRIDAYhours",
  "SATURDAYhours"
];

function getFormDataAsObject(formEl) {
  const obj = {};

  columns.forEach((name) => {
    const field = formEl.elements[name];
    if (!field) {
      obj[name] = "";
      return;
    }

    if (field.type === "checkbox") {
      obj[name] = field.checked;
    } else {
      obj[name] = field.value.trim();
    }
  });

  obj.secret = SHARED_SECRET;
  return obj;
}

document.getElementById("placeForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const payload = getFormDataAsObject(form);

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    const result = JSON.parse(text);

    if (result.ok) {
      alert("Saved to Google Sheet.");
      form.reset();
    } else {
      alert(`Save failed: ${result.error || "Unknown error"}`);
    }
  } catch (err) {
    alert(`Network error: ${err}`);
  }
});