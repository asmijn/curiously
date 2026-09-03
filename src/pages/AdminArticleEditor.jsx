import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";

const emptySection = {
  heading: "",
  body: "",
};

export default function AdminArticleEditor() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const isEditing = Boolean(slug);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    slug: "",
    title: "",
    subtitle: "",
    category_id: "",
    format: "",
    tag: "",
    read_time: "",
    date: "",
    color: "pink",
    dek: "",
    cover_image: "",
    content: "",
    published: false,
    sections: [
      {
        heading: "",
        body: "",
      },
    ],
  });

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin-login");
        return;
      }

      await loadCategories();

      if (isEditing) {
        await loadArticle();
      } else {
        setLoading(false);
      }
    }

    initialize();
  }, [slug]);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Categories error:", error);
      setError("Could not load categories.");
      return;
    }

    setCategories(data || []);
  }

  async function loadArticle() {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Article loading error:", error);
      setError("Could not load article.");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Article not found.");
      setLoading(false);
      return;
    }

    setForm({
      slug: data.slug || "",
      title: data.title || "",
      subtitle: data.subtitle || "",
      category_id: data.category_id || "",
      format: data.format || "",
      tag: data.tag || "",
      read_time: data.read_time || "",
      date: data.date || "",
      color: data.color || "pink",
      dek: data.dek || "",
      cover_image: data.cover_image || "",
      content: data.content || "",
      published: data.published || false,
      sections:
        Array.isArray(data.sections) &&
        data.sections.length
          ? data.sections
          : [emptySection],
    });

    setLoading(false);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(value) {
    setForm((current) => {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return {
        ...current,
        title: value,
        slug: isEditing
          ? current.slug
          : generatedSlug,
      };
    });
  }

  function updateSection(index, field, value) {
    setForm((current) => {
      const sections = [...current.sections];

      sections[index] = {
        ...sections[index],
        [field]: value,
      };

      return {
        ...current,
        sections,
      };
    });
  }

  function addSection() {
    setForm((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          heading: "",
          body: "",
        },
      ],
    }));
  }

  function removeSection(index) {
    setForm((current) => {
      const sections = current.sections.filter(
        (_, sectionIndex) => sectionIndex !== index
      );

      return {
        ...current,
        sections: sections.length
          ? sections
          : [emptySection],
      };
    });
  }

  async function uploadCover(file) {
    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG, WEBP, or GIF image."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB.");
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `cover-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const filePath = `covers/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("article-covers")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        console.error(
          "Cover upload error:",
          uploadError
        );

        setError(
          uploadError.message ||
            "Could not upload the cover image."
        );

        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("article-covers")
        .getPublicUrl(filePath);

      console.log(
        "COVER PUBLIC URL:",
        publicUrl
      );

      setForm((current) => ({
        ...current,
        cover_image: publicUrl,
      }));

      setMessage(
        "Cover uploaded. Now save the article."
      );
    } catch (uploadError) {
      console.error(
        "Unexpected cover upload error:",
        uploadError
      );

      setError(
        "Something went wrong uploading the cover."
      );
    }

    setUploading(false);
  }

  async function removeCover() {
    if (!form.cover_image) return;

    try {
      const marker =
        "/storage/v1/object/public/article-covers/";

      const markerIndex =
        form.cover_image.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath =
          form.cover_image.substring(
            markerIndex + marker.length
          );

        const { error } =
          await supabase.storage
            .from("article-covers")
            .remove([filePath]);

        if (error) {
          console.error(
            "Storage removal error:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Cover removal error:",
        error
      );
    }

    updateField("cover_image", "");

    setMessage(
      "Cover removed. Save the article to update it."
    );
  }

  async function saveArticle(
    publishedValue = form.published
  ) {
    setSaving(true);
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Please enter an article title.");
      setSaving(false);
      return;
    }

    if (!form.slug.trim()) {
      setError("Please enter a URL slug.");
      setSaving(false);
      return;
    }

    const articleData = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      category_id:
        form.category_id || null,
      format: form.format.trim(),
      tag: form.tag.trim(),
      read_time: form.read_time.trim(),
      date: form.date.trim(),
      color: form.color,
      dek: form.dek.trim(),

      // THIS IS THE IMPORTANT FIELD
      cover_image:
        form.cover_image?.trim() || null,

      content: form.content,
      published: publishedValue,
      sections: form.sections,
    };

    console.log(
      "SAVING ARTICLE:",
      articleData
    );

    console.log(
      "COVER BEING SAVED:",
      articleData.cover_image
    );

    let saveError = null;

    if (isEditing) {
      const result = await supabase
        .from("articles")
        .update(articleData)
        .eq("slug", slug);

      saveError = result.error;
    } else {
      const result = await supabase
        .from("articles")
        .insert(articleData);

      saveError = result.error;
    }

    if (saveError) {
      console.error(
        "SAVE ARTICLE ERROR:",
        saveError
      );

      setError(
        saveError.message ||
          "Could not save article."
      );

      setSaving(false);
      return;
    }

    console.log(
      "ARTICLE SAVED SUCCESSFULLY"
    );

    /*
      Verify the database actually contains
      the cover URL after saving.
    */
    const {
      data: savedArticle,
      error: verifyError,
    } = await supabase
      .from("articles")
      .select(
        "slug, cover_image, published"
      )
      .eq("slug", form.slug.trim())
      .maybeSingle();

    if (verifyError) {
      console.error(
        "VERIFY SAVE ERROR:",
        verifyError
      );
    } else {
      console.log(
        "DATABASE COVER IMAGE:",
        savedArticle?.cover_image
      );

      console.log(
        "DATABASE PUBLISHED:",
        savedArticle?.published
      );
    }

    setMessage(
      publishedValue
        ? "Article published successfully."
        : "Article saved as draft."
    );

    setSaving(false);

    if (!isEditing) {
      navigate(
        `/admin/edit/${form.slug.trim()}`
      );
    }
  }

  async function handleSaveDraft() {
    await saveArticle(false);
  }

  async function handlePublish() {
    await saveArticle(true);
  }

  if (loading) {
    return (
      <main className="admin-editor-page">
        <div className="admin-loading">
          LOADING EDITOR...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-editor-page">
      <header className="admin-editor-header">
        <div>
          <button
            className="admin-back"
            onClick={() => navigate("/admin")}
          >
            ← BACK TO ADMIN
          </button>

          <div className="section-kicker">
            CURIOUSLY / ARTICLE EDITOR
          </div>

          <h1>
            {isEditing ? (
              <>
                EDIT
                <br />
                <em>STORY.</em>
              </>
            ) : (
              <>
                NEW
                <br />
                <em>STORY.</em>
              </>
            )}
          </h1>
        </div>

        <div className="admin-editor-actions">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
          >
            {saving
              ? "SAVING..."
              : "SAVE DRAFT"}
          </button>

          <button
            className="admin-primary-button"
            onClick={handlePublish}
            disabled={saving}
          >
            {saving
              ? "SAVING..."
              : "PUBLISH →"}
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      <section className="admin-editor-section">
        <div className="section-kicker">
          01 / STORY DETAILS
        </div>

        <div className="admin-editor-grid">
          <label>
            TITLE

            <input
              value={form.title}
              onChange={(event) =>
                handleTitleChange(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            SUBTITLE

            <textarea
              value={form.subtitle}
              onChange={(event) =>
                updateField(
                  "subtitle",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            CATEGORY

            <select
              value={form.category_id}
              onChange={(event) =>
                updateField(
                  "category_id",
                  event.target.value
                )
              }
            >
              <option value="">
                SELECT CATEGORY
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            FORMAT

            <input
              value={form.format}
              onChange={(event) =>
                updateField(
                  "format",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            TAG

            <input
              value={form.tag}
              onChange={(event) =>
                updateField(
                  "tag",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            READ TIME

            <input
              value={form.read_time}
              onChange={(event) =>
                updateField(
                  "read_time",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            DATE

            <input
              value={form.date}
              onChange={(event) =>
                updateField(
                  "date",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            COLOR

            <select
              value={form.color}
              onChange={(event) =>
                updateField(
                  "color",
                  event.target.value
                )
              }
            >
              <option value="pink">
                PINK
              </option>

              <option value="yellow">
                YELLOW
              </option>

              <option value="blue">
                BLUE
              </option>

              <option value="lavender">
                LAVENDER
              </option>

              <option value="mint">
                MINT
              </option>
            </select>
          </label>

          <label>
            URL SLUG

            <input
              value={form.slug}
              onChange={(event) =>
                updateField(
                  "slug",
                  event.target.value
                )
              }
            />

            <small>
              Your article will live at{" "}
              /article/{form.slug}
            </small>
          </label>
        </div>
      </section>

      <section className="admin-editor-section">
        <div className="section-kicker">
          02 / ARTICLE COVER
        </div>

        <div className="cover-upload-area">
          <h2>ARTICLE COVER</h2>

          <p>
            Upload a JPG, PNG, WEBP, or GIF.
            Maximum 10MB.
          </p>

          {form.cover_image ? (
            <div className="cover-preview">
              <img
                src={form.cover_image}
                alt="Article cover preview"
              />

              <button
                type="button"
                onClick={removeCover}
              >
                REMOVE COVER
              </button>
            </div>
          ) : (
            <label className="cover-upload-button">
              {uploading
                ? "UPLOADING..."
                : "UPLOAD COVER →"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  uploadCover(
                    event.target.files?.[0]
                  )
                }
                disabled={uploading}
                hidden
              />
            </label>
          )}

          {form.cover_image && (
            <p className="cover-url">
              Cover URL:

              <br />

              {form.cover_image}
            </p>
          )}
        </div>
      </section>

      <section className="admin-editor-section">
        <div className="section-kicker">
          03 / STORY CONTENT
        </div>

        <label className="full-width-label">
          DEK

          <textarea
            value={form.dek}
            onChange={(event) =>
              updateField(
                "dek",
                event.target.value
              )
            }
          />
        </label>

        <div className="admin-sections-editor">
          {form.sections.map(
            (section, index) => (
              <div
                className="admin-section-editor"
                key={index}
              >
                <div className="admin-section-editor-top">
                  <span>
                    SECTION{" "}
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeSection(index)
                    }
                  >
                    REMOVE
                  </button>
                </div>

                <label>
                  HEADING

                  <input
                    value={section.heading}
                    onChange={(event) =>
                      updateSection(
                        index,
                        "heading",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  BODY

                  <textarea
                    rows="8"
                    value={section.body}
                    onChange={(event) =>
                      updateSection(
                        index,
                        "body",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            )
          )}
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={addSection}
        >
          + ADD SECTION
        </button>
      </section>

      <section className="admin-editor-section">
        <div className="section-kicker">
          04 / RAW CONTENT
        </div>

        <label className="full-width-label">
          CONTENT

          <textarea
            rows="12"
            value={form.content}
            onChange={(event) =>
              updateField(
                "content",
                event.target.value
              )
            }
          />
        </label>
      </section>

      <footer className="admin-editor-footer">
        <button
          onClick={() => navigate("/admin")}
        >
          ← CANCEL
        </button>

        <div>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
          >
            SAVE DRAFT
          </button>

          <button
            className="admin-primary-button"
            onClick={handlePublish}
            disabled={saving}
          >
            PUBLISH →
          </button>
        </div>
      </footer>
    </main>
  );
}