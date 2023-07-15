function processBase64Image(
  inputId,
  previewId,
  new_image_id,
  maxWidth,
  maxHeight
) {
  var fileInput = document.getElementById(inputId);
  fileInput.addEventListener("change", function () {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function () {
      var img = new Image();
      img.src = reader.result;
      img.onload = function () {
        var canvas = document.createElement("canvas");
        var newWidth = maxWidth;
        var newHeight = maxHeight;
        canvas.width = newWidth;
        canvas.height = newHeight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        var newDataUrl = canvas.toDataURL("image/png");
        var newImg = new Image();
        newImg.src = newDataUrl;
        newImg.classList.add("w-100"); // Add the "my-class" class
        var previewContainer = document.getElementById(previewId);
        newImg.id = new_image_id;
        var existingImg = previewContainer.querySelector("img");
        if (existingImg) {
          previewContainer.replaceChild(newImg, existingImg);
        } else {
          previewContainer.appendChild(newImg);
        }
      };
    });
    reader.readAsDataURL(file);
  });
}

async function submitEdit(profile_name, slug) {
  document.querySelector("#submit-edit-button").disabled = true;
  $("#submit-edit-spinner").toggleClass("invisible");
  const data = {
    name: $("#builder-name-input").val(),
    description: $("#description-textarea").val(),
    cover_image: $("#prompt-builder-cover-image").attr("src"),
  };

  try {
    const response = await fetch(
      `/en/submit-edit-prompt-builder/${profile_name}/${slug}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-amz-acl": "public-read",
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    if (responseData["status"] === 0) {
      removeErrorMessage();
      showErrorMessage(responseData["error_message"]);
    } else {
      window.location.pathname = `/th/prompt-builder/${slug}`;
    }
  } catch (error) {
    // Handle any errors that occurred during the fetch request
    console.error(error);
    // Display error message or handle it accordingly
  } finally {
    document.querySelector("#submit-edit-button").disabled = false;
    $("#submit-edit-spinner").toggleClass("invisible");
  }
}

async function getCategories(profile_name, slug) {
  try {
    const response = await fetch(`/en/get-categories/${profile_name}/${slug}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const data = await response.json();

    removeCategoryItems(category_nav);

    createCategoryItems(data["categories"], profile_name, slug);
  } catch (error) {
    console.error(error);
  }
}

function removeCategoryItems(category_nav) {
  category_nav.innerHTML = "";
}

function createCategoryItems(categories, profile_name, slug) {
  for (var i = 0; i < categories.length; i++) {
    appendCategoryNav(categories[i], profile_name, slug);
  }
}

function appendCategoryNav(category, profile_name, slug) {
  var category_nav_item_template = document.querySelector(
    "#category-nav-item-template"
  );

  let category_nav_item_template_clone = category_nav_item_template.content.cloneNode(
    true
  );

  category_nav_item_template_clone.querySelector(
    "#category-nav-item"
  ).innerHTML = `${category["name"]}`;

  category_nav_item_template_clone
    .querySelector("#category-nav-item")
    .addEventListener("click", toggleCategory(category, profile_name, slug));

  category_nav_item_template_clone.querySelector(
    "#category-nav-item"
  ).id = `${category["slug"]}`;

  category_nav.insertAdjacentElement(
    "beforeend",
    category_nav_item_template_clone.children[0]
  );
}

function showCategoryInfo(category_name, category_slug, profile_name, slug) {
  $("#category-name-header").html(category_name);
  $("#category-name").html(
    `<h2 id="category-name-header" class="me-2">${category_name}</h2>`
  );
  $("#edit-category-name").html(`
        <button
          id="edit-category-name-button"
          type="button"
          class="btn btn-light w-100"
          name="edit-category-nav-button"
        >
          เปลี่ยนชื่อหมวดหมู่
          <i class="bi bi-pencil-square"></i>
        </button>
      `);

  $("#delete-category").html(`
          <button
            id="delete-category-button"
            type="button"
            class="btn btn-danger w-100"
            name="delete-category-button"
            data-bs-toggle="modal"
            data-bs-target="#delete-category-modal"
          >
            ลบหมวดหมู่
            <i class="bi bi-trash-fill"></i>
          </button>
          <!-- Modal -->
          <div class="modal fade" id="delete-category-modal" tabindex="-1" aria-labelledby="delete-category-modal-label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5" id="delete-category-modal-label">คุณมั่นใจที่จะลบหมวดหมู่นี้ใช้ไหม?</h1>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">ฉันเปลี่ยนใจ</button>
                  <button type="button" class="btn btn-danger" onclick="submitDeleteCategoryName('${profile_name}', '${slug}')">ใช่! ลบทิ้งเดี๋ยวนี้</button>
                </div>
              </div>
            </div>
          </div>
      `);
}

function removePromptKeywords() {
  $('div[id="prompt-keywords"]').html(``);
}

function addCategory(profile_name, slug) {
  document.querySelector("#category-button").disabled = true;
  let category = {
    category_name: $('input[id="category-input"]').val(),
  };
  fetch(`/en/add-category-prompt-builder/${profile_name}/${slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  }).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removeErrorMessage();
        showErrorMessage(data["error_message"]);
        document.querySelector("#category-button").disabled = false;
      } else {
        removeErrorMessage();
        appendCategoryNav(data["category"], profile_name, slug);
        removeCategoryInputValue();
        document.querySelector("#category-button").disabled = false;
      }
    });
  });
}

function removeCategoryInputValue() {
  $('input[id="category-input"]').val("");
}

function submitDeleteCategoryName(profile_name, slug) {
  let category = {
    category_name: $(".category-nav-item.active").html(),
    category_slug: $(".category-nav-item.active").attr("id"),
  };
  fetch(
    `/en/submit-delete-category-name-prompt-builder/${profile_name}/${slug}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    }
  ).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removeErrorMessage();
        showErrorMessage(data["error_message"]);
      } else {
        removeCategory(data["category"]["slug"]);
      }
    });
  });
}

function removeCategory(category_slug) {
  $("#delete-category-modal").modal("hide");
  $("#category-name-header").html("");
  $("#category-name").html("");
  $("#edit-category-name").html("");
  $("#delete-category").html("");
  $("#prompt-keywords").html("");
  $(`#${category_slug}`).remove();
}

function setEditCategoryNameButton(profile_name, slug) {
  $("#edit-category-name-button").on("click", function () {
    let category_name = $("#category-name-header").html();
    $("#edit-category-name").html(`
          <button id="submit-edit-category-name-button" type="button" class="btn btn-light" onclick="submitEditCategoryName('${profile_name}', '${slug}')">✓</button>
          <button id="cancel-edit-category-name-button"type="button" class="btn btn-dark" onclick="cancelEditCategoryName('${category_name}')">x</button>
        `);
    $("#category-name").html(
      `
            <input type="text" class="form-control" id="edit-category-name-input" value="${category_name}" maxlength=15>
          `
    );

    document
      .getElementById("edit-category-name-input")
      .addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
          var submitButton = document.querySelector(
            "#submit-edit-category-name-button"
          );
          if (!submitButton.disabled) {
            submitButton.click();
            submitButton.disabled = true;
          }
        } else if (event.keyCode == 27) {
          var cancelButton = document.querySelector(
            "#cancel-edit-category-name-button"
          );
          if (!cancelButton.disabled) {
            cancelButton.click();
            cancelButton.disabled = true;
          }
        }
      });
  });
}

function submitEditCategoryName(profile_name, slug) {
  let category = {
    old_category_name: $(".category-nav-item.active").html(),
    new_category_name: $("#edit-category-name-input").val(),
    category_slug: $(".category-nav-item.active").attr("id"),
  };
  fetch(
    `/en/submit-edit-category-name-prompt-builder/${profile_name}/${slug}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    }
  ).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removeErrorMessage();
        showErrorMessage(data["error_message"]);
        document.querySelector(
          "#submit-edit-category-name-button"
        ).disabled = false;
      } else {
        removeErrorMessage();
        showCategoryInfo(data["category"]["name"], data["category"]["slug"]);
        setEditCategoryNameButton(profile_name, slug);
        changeCategoryNameNav(
          data["category"]["name"],
          data["category"]["slug"]
        );
      }
    });
  });
}

function changeCategoryNameNav(new_category_name, category_slug) {
  $(`#${category_slug}`).html(new_category_name);
}

function cancelEditCategoryName(category_name) {
  $("#category-name").html(
    `<h2 id="category-name-header" class="me-2">${category_name}</h2>`
  );
  $("#edit-category-name").html(`
        <button
          id="edit-category-name-button"
          type="button"
          class="btn btn-light w-100"
          name="button"
        >
          เปลี่ยนชื่อหมวดหมู่
          <i class="bi bi-pencil-square"></i>
        </button>
      `);
  setEditCategoryNameButton();
}

function getPrompts(category_slug, profile_name, slug) {
  fetch(`/en/get-prompts-prompt-builder/${slug}/${category_slug}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removeErrorMessage();
        showErrorMessage(data["error_message"]);
      } else {
        removeErrorMessage();
        createAddPromptButton(category_slug, profile_name, slug);
        createPromptItems(category_slug, data["prompts"], profile_name, slug);
      }
    });
  });
}

function createAddPromptButton(category_slug, profile_name, slug) {
  $('div[id="prompt-keywords"]').html(`
    <div class="row" id="prompt-keywords-list">
      <div role="button" class="dropzone card col-2 me-3 mb-3 p-0">
        <img
          src="/static/add-prompt-blank-image.png"
          alt="Prompt builder's image"
          class="w-100"
        />
        <div class="card-body row">
          <div class="col-8">
              <p class="card-text">ADD PROMPT</p>
          </div>
          <div class="col-4 text-center">
              <p class="card-text">+</p>
          </div>
        </div>
      </div>
    </div>
  `);

  initializeDropzone();
}

function addPrompt(category_slug, profile_name, slug) {
  disableSubmitAddPromptButton();
  let prompt = {
    prompt: {
      name: $("#prompt-name-input").val(),
      base64_image: $("#prompt-image-modal").attr("src"),
    },
  };
  fetch(
    `/en/add-prompt-prompt-builder/${profile_name}/${slug}/${category_slug}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(prompt),
    }
  ).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removePromptErrorMessage();
        showPromptErrorMessage(data["error_message"]);
        enableSubmitAddPromptButton();
      } else {
        removePromptErrorMessage();
        hidePromptModal();
        appendPromptItem(category_slug, data["prompt"], profile_name, slug);
        enableSubmitAddPromptButton();
      }
    });
  });
}

function disableSubmitAddPromptButton() {
  var submitAddPromptButton = document.querySelector(
    "#submit-add-prompt-button"
  );
  submitAddPromptButton.disabled = true;
}

function removePromptErrorMessage() {
  $('span[id="prompt-error-message"]').text("");
}

function showPromptErrorMessage(error_message) {
  $('span[id="prompt-error-message"]').text("* " + error_message);
}

function enableSubmitAddPromptButton() {
  var submitAddPromptButton = document.querySelector(
    "#submit-add-prompt-button"
  );
  submitAddPromptButton.disabled = false;
}

function hidePromptModal() {
  $("#prompt-modal").modal("hide");
}

function createPromptItems(category_slug, prompts, profile_name, slug) {
  for (var i = 0; i < prompts.length; i++) {
    appendPromptItem(category_slug, prompts[i], profile_name, slug);
  }
}

function submitEditPrompt(category_slug, prompt_slug, profile_name, slug) {
  let prompt = {
    prompt: {
      name: $("#prompt-name-input").val(),
      base64_image: $("#prompt-image-modal").attr("src"),
      slug: prompt_slug,
    },
  };

  fetch(
    `/en/submit-edit-prompt-prompt-builder/${profile_name}/${slug}/${category_slug}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(prompt),
    }
  ).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removePromptErrorMessage();
        showPromptErrorMessage(data["error_message"]);
      } else {
        removePromptErrorMessage();
        hidePromptModal();
        changePromptItem(
          data["prompt"]["slug"],
          data["prompt"]["name"],
          data["prompt"]["image_url"]
        );
      }
    });
  });
}

function changePromptItem(slug, name, image_url) {
  $(`div[id='${slug}'] #prompt-name`).html(`${name}`);
  $(`div[id='${slug}'] #prompt-image`).attr("src", image_url);
}

function toggleCategory(category, profile_name, slug) {
  return function (event) {
    event.preventDefault();
    $(".category-nav-item.active").toggleClass("active");
    $(".category-nav-item.disabled").toggleClass("disabled");
    this.classList.add("active");
    this.classList.add("disabled");
    showCategoryInfo(category["name"], category["slug"], profile_name, slug);
    getPrompts(category["slug"], profile_name, slug);
    setEditCategoryNameButton(profile_name, slug);
    removePromptKeywords();
  };
}

function appendPromptItem(category_slug, prompt, profile_name, slug) {
  var prompt_keywords = document.querySelector("#prompt-keywords");
  var prompt_item_template = document.querySelector("#prompt-item-template");

  let prompt_item_template_clone = prompt_item_template.content.cloneNode(true);

  prompt_item_template_clone.querySelector(
    "#prompt-image"
  ).src = `${prompt["image_url"]}`;

  prompt_item_template_clone.querySelector(
    "#prompt-name"
  ).innerHTML = `${prompt["name"]}`;

  prompt_item_template_clone
    .querySelector("#prompt-item")
    .addEventListener("click", function () {
      togglePrompt(category_slug, prompt, profile_name, slug);
    });

  prompt_item_template_clone.querySelector(
    "#prompt-item"
  ).id = `${prompt["slug"]}`;

  prompt_keywords
    .querySelector("#prompt-keywords-list")
    .insertAdjacentElement("beforeend", prompt_item_template_clone.children[0]);
}

function togglePrompt(category_slug, prompt, profile_name, slug) {
  removePromptErrorMessage();

  // $('div[id="prompt-modal-footer"]').html(`
  //     <button id="remove-prompt-button" type="button" class="btn btn-danger")">ลบทิ้ง</button>
  //     <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
  //     <button id="submit-edit-prompt-button" type="button" class="btn btn-primary">แก้ไข</button>
  // `);
  //
  // document
  //   .querySelector("#remove-prompt-button")
  //   .addEventListener("click", function () {
  //     verifyRemovePrompt(category_slug, prompt, profile_name, slug);
  //   });
  //
  // document
  //   .querySelector("#submit-edit-prompt-button")
  //   .addEventListener("click", function () {
  //     submitEditPrompt(category_slug, prompt["slug"], profile_name, slug);
  //   });

  // $('img[id="prompt-image-modal"]').attr(
  //   "src",
  //   $(`div[id='${prompt["slug"]}'] #prompt-image`).attr("src")
  // );
  // $('input[id="prompt-name-input"]').val(
  //   $(`div[id='${prompt["slug"]}'] #prompt-name`).html()
  // );
  // $('h1[id="prompt-modal-label"]').html("แก้ไข Prompt");
}

function verifyRemovePrompt(category_slug, prompt, profile_name, slug) {
  $('div[id="prompt-modal-footer"]').html(`
    <div class="row">
      <div class="col-6">
        <p>ท่านยืนยันที่จะลบ Prompt นี้?</p>

      </div>
      <div class="col-6">
        <button id="cancel-remove-prompt-button" type="button" class="btn btn-secondary">ยกเลิก</button>
        <button id="submit-remove-prompt-button" type="button" class="btn btn-primary" onclick="submitRemovePrompt('${category_slug}', '${prompt["slug"]}', '${profile_name}', '${slug}')">ยืนยัน</button>
      </div>

    </div>
  `);

  $("#cancel-remove-prompt-button").on("click", function () {
    togglePrompt(category_slug, prompt, profile_name, slug);
  });
}

function submitRemovePrompt(category_slug, prompt_slug, profile_name, slug) {
  let prompt = {
    prompt: {
      slug: prompt_slug,
    },
  };
  fetch(
    `/en/submit-remove-prompt-prompt-builder/${profile_name}/${slug}/${category_slug}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(prompt),
    }
  ).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removePromptErrorMessage();
        showPromptErrorMessage(data["error_message"]);
      } else {
        hidePromptModal();
        removePromptItem(data["prompt"]["slug"]);
      }
    });
  });
}

function removePromptItem(prompt_slug) {
  $(`div[id='${prompt_slug}']`).remove();
}

function createPromptBuilderInfo(info) {
  $("#builder-name-input").val(info["name"]);
  $("#description-textarea").val(info["description"]);
  if (info["cover_image_url"] != "") {
    $("#prompt-builder-cover-image").attr("src", info["cover_image_url"]);
  }
}

async function getPromptBuilderInfo(profile_name, slug) {
  try {
    const res = await fetch(
      `/en/get-prompt-builder-info/${profile_name}/${slug}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    const data = await res.json();
    createPromptBuilderInfo(data["prompt_builder_info"]);
  } catch (error) {
    console.error(error);
  }
}

function updateCategoryOrder(category_order) {
  let category_order_json = {
    category_order: category_order,
  };
  fetch(`/en/update-category-order-prompt-builder/${profile_name}/${slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category_order_json),
  }).then((res) => {
    res.json().then((data) => {
      if (data["status"] == 0) {
        removeErrorMessage();
        showErrorMessage(data["error_message"]);
      }
    });
  });
}
