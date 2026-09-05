import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
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
    sections: [{ ...emptySection }],
  });

  // =========================================================
  // INITIALIZE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error(
            "Auth error:",
            authError
          );
        }

        if (!user) {
          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        // Load categories
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoryError) {
          console.error(
            "Categories error:",
            categoryError
          );

          if (!cancelled) {
            setError(
              categoryError.message ||
                "Could not load categories."
            );
          }
        } else if (!cancelled) {
          setCategories(categoryData || []);
        }

        // Load existing article
        if (isEditing) {
          const {
            data: articleData,
            error: articleError,
          } = await supabase
            .from("articles")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();

          if (articleError) {
            console.error(
              "Article loading error:",
              articleError
            );

            if (!cancelled) {
              setError(
                articleError.message ||
                  "Could not load article."
              );
            }

            return;
          }

          if (!articleData) {
            if (!cancelled) {
              setError(
                "Article not found."
              );
            }

            return;
          }

          if (!cancelled) {
            setForm({
              slug:
                articleData.slug || "",

              title:
                articleData.title || "",

              subtitle:
                articleData.subtitle || "",

              category_id:
                articleData.category_id || "",

              format:
                articleData.format || "",

              tag:
                articleData.tag || "",

              read_time:
                articleData.read_time || "",

              date:
                articleData.date || "",

              color:
                articleData.color ||
                "pink",

              dek:
                articleData.dek || "",

              cover_image:
                articleData.cover_image ||
                "",

              content:
                articleData.content || "",

              published:
                Boolean(
                  articleData.published
                ),

              sections:
                Array.isArray(
                  articleData.sections
                ) &&
                articleData.sections.length > 0
                  ? articleData.sections.map(
                      (section) => ({
                        heading:
                          section?.heading ||
                          "",

                        body:
                          section?.body ||
                          "",
                      })
                    )
                  : [{ ...emptySection }],
            });
          }
        }
      } catch (err) {
        console.error(
          "Editor initialization error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Could not load the editor."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [slug, isEditing, navigate]);

  // =========================================================
  // FIELD UPDATES
  // =========================================================

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

        // Only auto-generate the slug
        // when creating a new article.
        slug: isEditing
          ? current.slug
          : generatedSlug,
      };
    });
  }

  // =========================================================
  // SECTIONS
  // =========================================================

  function updateSection(
    index,
    field,
    value
  ) {
    setForm((current) => {
      const sections = [
        ...current.sections,
      ];

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
      const sections =
        current.sections.filter(
          (_, sectionIndex) =>
            sectionIndex !== index
        );

      return {
        ...current,

        sections:
          sections.length > 0
            ? sections
            : [{ ...emptySection }],
      };
    });
  }

  // =========================================================
  // COVER IMAGE UPLOAD
  // =========================================================

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
      setError(
        "Image must be smaller than 10MB."
      );

      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const fileName =
        `cover-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`;

      const filePath =
        `covers/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("article-covers")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

      if (uploadError) {
        console.error(
          "Cover upload error:",
          uploadError
        );

        setError(
          uploadError.message ||
            "Could not upload the cover image."
        );

        return;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("article-covers")
        .getPublicUrl(
          filePath
        );

      const publicUrl =
        publicUrlData?.publicUrl;

      if (!publicUrl) {
        setError(
          "The image uploaded, but we couldn't create its public URL."
        );

        return;
      }

      setForm((current) => ({
        ...current,
        cover_image: publicUrl,
      }));

      setMessage(
        "Cover uploaded. Save the article to keep it."
      );
    } catch (err) {
      console.error(
        "Unexpected cover upload error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong uploading the cover."
      );
    } finally {
      setUploading(false);
    }
  }

  // =========================================================
  // REMOVE COVER
  // =========================================================

  async function removeCover() {
    if (!form.cover_image) return;

    try {
      const marker =
        "/storage/v1/object/public/article-covers/";

      const markerIndex =
        form.cover_image.indexOf(
          marker
        );

      if (markerIndex !== -1) {
        const filePath =
          form.cover_image.substring(
            markerIndex +
              marker.length
          );

        const {
          error: storageError,
        } = await supabase.storage
          .from("article-covers")
          .remove([filePath]);

        if (storageError) {
          console.error(
            "Storage removal error:",
            storageError
          );
        }
      }
    } catch (err) {
      console.error(
        "Cover removal error:",
        err
      );
    }

    updateField(
      "cover_image",
      ""
    );

    setMessage(
      "Cover removed. Save the article to update it."
    );
  }

  // =========================================================
  // SAVE ARTICLE
  // =========================================================

  async function saveArticle(
    publishedValue = form.published
  ) {
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      // -----------------------------------------------------
      // AUTH CHECK
      // -----------------------------------------------------

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      const title =
        form.title.trim();

      const articleSlug =
        form.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-+|-+$/g, "");

      if (!title) {
        setError(
          "Please enter an article title."
        );

        return;
      }

      if (!articleSlug) {
        setError(
          "Please enter a URL slug."
        );

        return;
      }

      // -----------------------------------------------------
      // CLEAN SECTIONS
      // -----------------------------------------------------

      const cleanedSections =
        form.sections
          .map((section) => ({
            heading:
              section?.heading?.trim() ||
              "",

            body:
              section?.body?.trim() ||
              "",
          }))
          .filter(
            (section) =>
              section.heading ||
              section.body
          );

      // -----------------------------------------------------
      // ARTICLE DATA
      // -----------------------------------------------------

      const articleData = {
        slug: articleSlug,

        title,

        subtitle:
          form.subtitle.trim(),

        category_id:
          form.category_id ||
          null,

        format:
          form.format.trim(),

        tag:
          form.tag.trim(),

        read_time:
          form.read_time.trim(),

        date:
          form.date.trim(),

        color:
          form.color || "pink",

        dek:
          form.dek.trim(),

        cover_image:
          form.cover_image?.trim() ||
          null,

        content:
          form.content?.trim() ||
          "",

        published:
          Boolean(publishedValue),

        sections:
          cleanedSections,
      };

      console.log(
        "Saving article:",
        articleData
      );

      // -----------------------------------------------------
      // UPDATE EXISTING ARTICLE
      // -----------------------------------------------------

      if (isEditing) {
        const {
          data: updatedArticle,
          error: updateError,
        } = await supabase
          .from("articles")
          .update(articleData)
          .eq("slug", slug)
          .select()
          .maybeSingle();

        if (updateError) {
          console.error(
            "UPDATE ARTICLE ERROR:",
            updateError
          );

          throw updateError;
        }

        if (!updatedArticle) {
          throw new Error(
            "The article could not be found to update."
          );
        }

        setForm((current) => ({
          ...current,

          slug:
            updatedArticle.slug,

          published:
            Boolean(
              updatedArticle.published
            ),

          sections:
            cleanedSections.length
              ? cleanedSections
              : [{ ...emptySection }],
        }));

        setMessage(
          publishedValue
            ? "Article published successfully."
            : "Article saved as draft."
        );

        // If the slug changed while editing,
        // update the URL.
        if (
          updatedArticle.slug !== slug
        ) {
          navigate(
            `/admin/edit/${updatedArticle.slug}`,
            {
              replace: true,
            }
          );
        }

        return;
      }

      // -----------------------------------------------------
      // CREATE NEW ARTICLE
      // -----------------------------------------------------

      const {
        data: newArticle,
        error: insertError,
      } = await supabase
        .from("articles")
        .insert(articleData)
        .select()
        .single();

      if (insertError) {
        console.error(
          "INSERT ARTICLE ERROR:",
          insertError
        );

        throw insertError;
      }

      if (!newArticle) {
        throw new Error(
          "The article was not created."
        );
      }

      setForm((current) => ({
        ...current,

        slug:
          newArticle.slug,

        published:
          Boolean(
            newArticle.published
          ),

        sections:
          cleanedSections.length
            ? cleanedSections
            : [{ ...emptySection }],
      }));

      setMessage(
        publishedValue
          ? "Article published successfully."
          : "Article saved as draft."
      );

      // Move new article into edit mode
      navigate(
        `/admin/edit/${newArticle.slug}`,
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "SAVE ARTICLE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Could not save article."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // BUTTONS
  // =========================================================

  async function handleSaveDraft() {
    await saveArticle(false);
  }

  async function handlePublish() {
    await saveArticle(true);
  }

  // =========================================================
  // PREVIEW
  // =========================================================

  function previewArticle() {
    const articleSlug =
      form.slug.trim();

    if (!articleSlug) {
      setError(
        "Save the article before previewing it."
      );

      return;
    }

    window.open(
      `/article/${articleSlug}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // =========================================================
  // WORD COUNT
  // =========================================================

  const wordCount =
    form.sections.reduce(
      (total, section) => {
        const words =
          `${section?.heading || ""} ${
            section?.body || ""
          }`
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        return (
          total + words.length
        );
      },
      0
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-editor-page">
        <div className="admin-loading">
          LOADING EDITOR...
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="admin-editor-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="writer-header">

        <div className="writer-header-left">

          <button
            className="writer-back"
            onClick={() =>
              navigate("/admin")
            }
            type="button"
          >
            <ArrowLeft size={15} />
            BACK TO ADMIN
          </button>

          <div className="writer-brand">
            <span>
              CURIOUSLY
            </span>

            <span>
              WRITER
            </span>
          </div>

        </div>


        <div className="writer-header-actions">

          <button
            type="button"
            className="writer-preview-button"
            onClick={previewArticle}
            disabled={saving}
          >
            <Eye size={15} />
            PREVIEW
          </button>


          <button
            type="button"
            className="writer-save-button"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            <Save size={15} />

            {saving
              ? "SAVING..."
              : "SAVE DRAFT"}
          </button>


          <button
            type="button"
            className="writer-publish-button"
            onClick={handlePublish}
            disabled={saving}
          >
            {saving
              ? "SAVING..."
              : "PUBLISH →"}
          </button>

        </div>

      </header>


      {/* =====================================================
          MESSAGES
          ===================================================== */}

      {error && (
        <div className="writer-message writer-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>

        </div>
      )}


      {message && (
        <div className="writer-message writer-success">

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
            aria-label="Dismiss message"
          >
            <X size={15} />
          </button>

        </div>
      )}


      {/* =====================================================
          EDITOR
          ===================================================== */}

      <div className="writer-layout">

        {/* ===================================================
            MAIN
            =================================================== */}

        <div className="writer-main">

          {/* TITLE */}

          <section className="writer-title-area">

            <input
              className="writer-title"
              value={form.title}
              onChange={(event) =>
                handleTitleChange(
                  event.target.value
                )
              }
              placeholder="Write your headline..."
              aria-label="Article title"
            />


            <textarea
              className="writer-subtitle"
              value={form.subtitle}
              onChange={(event) =>
                updateField(
                  "subtitle",
                  event.target.value
                )
              }
              placeholder="Write a short introduction to your story..."
              rows="2"
              aria-label="Article subtitle"
            />


            <div className="writer-slug">

              <span>
                /article/
              </span>

              <input
                value={form.slug}
                onChange={(event) =>
                  updateField(
                    "slug",
                    event.target.value
                  )
                }
                aria-label="Article URL slug"
              />

            </div>

          </section>


          {/* INTRO */}

          <section className="writer-section">

            <div className="writer-section-label">
              STORY INTRO
            </div>

            <textarea
              className="writer-dek"
              value={form.dek}
              onChange={(event) =>
                updateField(
                  "dek",
                  event.target.value
                )
              }
              placeholder="Start with the thought that pulls the reader in..."
              rows="4"
              aria-label="Article dek"
            />

          </section>


          {/* STORY */}

          <section className="writer-section writer-story">

            <div className="writer-section-heading">

              <div>

                <span className="writer-section-label">
                  STORY
                </span>

                <span className="writer-word-count">
                  {wordCount} words
                </span>

              </div>

              <span className="writer-hint">
                Write freely. You can edit this later.
              </span>

            </div>


            <div className="writer-sections">

              {form.sections.map(
                (section, index) => (
                  <article
                    className="writer-story-section"
                    key={index}
                  >

                    <div className="writer-section-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>


                    <div className="writer-section-fields">

                      <input
                        className="writer-heading-input"
                        value={
                          section.heading
                        }
                        onChange={(event) =>
                          updateSection(
                            index,
                            "heading",
                            event.target
                              .value
                          )
                        }
                        placeholder="Section heading..."
                        aria-label={`Section ${
                          index + 1
                        } heading`}
                      />


                      <textarea
                        className="writer-body-input"
                        value={
                          section.body
                        }
                        onChange={(event) =>
                          updateSection(
                            index,
                            "body",
                            event.target
                              .value
                          )
                        }
                        placeholder="Start writing here..."
                        rows="10"
                        aria-label={`Section ${
                          index + 1
                        } body`}
                      />

                    </div>


                    {form.sections
                      .length > 1 && (
                      <button
                        type="button"
                        className="writer-remove-section"
                        onClick={() =>
                          removeSection(
                            index
                          )
                        }
                        aria-label={`Remove section ${
                          index + 1
                        }`}
                        title="Remove section"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    )}

                  </article>
                )
              )}

            </div>


            <button
              type="button"
              className="writer-add-section"
              onClick={addSection}
            >
              <Plus size={17} />
              ADD ANOTHER SECTION
            </button>

          </section>

        </div>


        {/* ===================================================
            SIDEBAR
            =================================================== */}

        <aside className="writer-sidebar">

          {/* PUBLISHING */}

          <section className="writer-sidebar-card">

            <div className="writer-sidebar-title">
              PUBLISHING
            </div>


            <div className="writer-status">

              <span
                className={
                  form.published
                    ? "status-dot published"
                    : "status-dot draft"
                }
              />

              {form.published
                ? "PUBLISHED"
                : "DRAFT"}

            </div>


            {/* CATEGORY */}

            <label className="writer-field">

              <span>
                CATEGORY
              </span>

              <select
                value={
                  form.category_id
                }
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

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

            </label>


            {/* FORMAT */}

            <label className="writer-field">

              <span>
                FORMAT
              </span>

              <input
                value={
                  form.format
                }
                onChange={(event) =>
                  updateField(
                    "format",
                    event.target.value
                  )
                }
                placeholder="THE RABBIT HOLE"
              />

            </label>


            {/* TAG */}

            <label className="writer-field">

              <span>
                TAG
              </span>

              <input
                value={
                  form.tag
                }
                onChange={(event) =>
                  updateField(
                    "tag",
                    event.target.value
                  )
                }
                placeholder="INTERNET CULTURE"
              />

            </label>


            {/* READ TIME */}

            <label className="writer-field">

              <span>
                READ TIME
              </span>

              <input
                value={
                  form.read_time
                }
                onChange={(event) =>
                  updateField(
                    "read_time",
                    event.target.value
                  )
                }
                placeholder="7 min read"
              />

            </label>


            {/* DATE */}

            <label className="writer-field">

              <span>
                DATE
              </span>

              <input
                value={
                  form.date
                }
                onChange={(event) =>
                  updateField(
                    "date",
                    event.target.value
                  )
                }
                placeholder="September 3, 2026"
              />

            </label>


            {/* COLOR */}

            <label className="writer-field">

              <span>
                ACCENT COLOR
              </span>

              <select
                value={
                  form.color
                }
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

          </section>


          {/* COVER */}

          <section className="writer-sidebar-card">

            <div className="writer-sidebar-title">
              COVER IMAGE
            </div>


            {form.cover_image ? (

              <div className="writer-cover">

                <img
                  src={
                    form.cover_image
                  }
                  alt="Article cover preview"
                />

                <button
                  type="button"
                  onClick={
                    removeCover
                  }
                >
                  <X size={14} />
                  REMOVE
                </button>

              </div>

            ) : (

              <label className="writer-upload">

                <ImagePlus size={24} />

                <strong>
                  {uploading
                    ? "UPLOADING..."
                    : "UPLOAD COVER"}
                </strong>

                <span>
                  JPG, PNG, WEBP or GIF
                  <br />
                  Maximum 10MB
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) =>
                    uploadCover(
                      event.target
                        .files?.[0]
                    )
                  }
                  disabled={
                    uploading
                  }
                  hidden
                />

                <span className="writer-upload-link">
                  <Upload
                    size={13}
                  />
                  CHOOSE IMAGE
                </span>

              </label>
            )}

          </section>


          {/* WRITING TIP */}

          <section className="writer-sidebar-card writer-tip">

            <div className="writer-sidebar-title">
              WRITING NOTE
            </div>

            <p>
              Don't worry about making every section
              perfect. Get the thought down first.
              You can always come back and edit.
            </p>

            <span>
              ✦ CURIOUSLY EDITORIAL
            </span>

          </section>

        </aside>

      </div>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="writer-footer">

        <button
          type="button"
          onClick={() =>
            navigate("/admin")
          }
        >
          <ArrowLeft size={15} />
          BACK TO ADMIN
        </button>


        <div>

          <button
            type="button"
            onClick={
              handleSaveDraft
            }
            disabled={saving}
          >
            SAVE DRAFT
          </button>


          <button
            type="button"
            onClick={
              handlePublish
            }
            disabled={saving}
          >
            PUBLISH →
          </button>

        </div>

      </footer>

    </main>
  );
}