import { useEffect, useRef, useState } from "react";
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
  LockKeyhole,
} from "lucide-react";
import { supabase } from "../supabase";

const emptySection = {
  heading: "",
  body: "",
};

const emptyMarginalia = {
  note: "",
  type: "THOUGHT",
  position: 1,
  link: "",
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

  const editorRefs = useRef([]);
  const selectionRefs = useRef([]);
  const historyRefs = useRef([]);
  const historyIndexRefs = useRef([]);
  const historyApplyingRef = useRef(false);

  const editorialColors = {
    ink: "#1c191b",
    red: "#b9414d",
    pink: "#edabc4",
    yellow: "#efd579",
    blue: "#a9d4dc",
    lavender: "#c8b8d8",
    mint: "#b9d5c4",
  };


  const highlightColors = {
    pink: "#f7dce8",
    yellow: "#f8edb9",
    blue: "#d8edf0",
    lavender: "#e6ddef",
    mint: "#dcebdd",
    peach: "#f6ddd0",
  };
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

    // SECRET ARTICLE
    secret: false,
    secret_code: "",

    // STORY SECTIONS
    sections: [{ ...emptySection }],

    // DIGITAL MARGINALIA
    marginalia: [],

    // THE RECEIPTS
    receipts: [],
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
          console.error("Auth error:", authError);
        }

        if (!user) {
          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        // -----------------------------------------------------
        // LOAD CATEGORIES
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // LOAD EXISTING ARTICLE
        // -----------------------------------------------------

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
              setError("Article not found.");
            }

            return;
          }

          if (!cancelled) {
            const loadedMarginalia =
              Array.isArray(articleData.marginalia)
                ? [...articleData.marginalia]
                    .sort(
                      (a, b) =>
                        (a?.position || 0) -
                        (b?.position || 0)
                    )
                    .map((item, index) => ({
                      note:
                        item?.note || "",

                      type:
                        item?.type ||
                        "THOUGHT",

                      position:
                        index + 1,

                      link:
                        item?.link || "",
                    }))
                : [];

            const {
              data: receiptData,
              error: receiptError,
            } = await supabase
              .from("article_receipts")
              .select("*")
              .eq("article_id", articleData.id)
              .order("sort_order", {
                ascending: true,
              });

            if (receiptError) {
              console.error(
                "Receipts loading error:",
                receiptError
              );
            }

            const loadedReceipts =
              Array.isArray(receiptData)
                ? receiptData.map((item, index) => ({
                    id: item.id,
                    type: item.type || "SOURCE",
                    title: item.title || "",
                    description: item.description || "",
                    source_url: item.source_url || "",
                    image_url: item.image_url || "",
                    author: item.author || "",
                    publication: item.publication || "",
                    published_date: item.published_date || "",
                    sort_order: Number.isFinite(item.sort_order)
                      ? item.sort_order
                      : index,
                  }))
                : [];

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
                articleData.color || "pink",

              dek:
                articleData.dek || "",

              cover_image:
                articleData.cover_image || "",

              content:
                articleData.content || "",

              published:
                Boolean(
                  articleData.published
                ),

              // ---------------------------------------------
              // SECRET ARTICLE
              // ---------------------------------------------

              secret:
                Boolean(
                  articleData.secret
                ),

              secret_code:
                articleData.secret_code || "",

              // ---------------------------------------------
              // SECTIONS
              // ---------------------------------------------

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

              // ---------------------------------------------
              // DIGITAL MARGINALIA
              // ---------------------------------------------

              marginalia:
                loadedMarginalia,

              receipts:
                loadedReceipts,
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
  // STORY SECTIONS
  // =========================================================

  function getEditorHtml(index) {
    return editorRefs.current[index]?.innerHTML || "";
  }

  function saveEditorSelection(index) {
    const editor = editorRefs.current[index];
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) return;

    selectionRefs.current[index] = range.cloneRange();
  }

  function restoreEditorSelection(index) {
    const savedRange = selectionRefs.current[index];
    const editor = editorRefs.current[index];
    const selection = window.getSelection();

    if (!savedRange || !editor || !selection) return false;

    try {
      if (!editor.contains(savedRange.commonAncestorContainer)) return false;

      selection.removeAllRanges();
      selection.addRange(savedRange);
      return true;
    } catch (err) {
      console.error("Could not restore editor selection:", err);
      return false;
    }
  }

  function updateEditorSection(index, html = null) {
    const value = html !== null ? html : getEditorHtml(index);
    updateSection(index, "body", value);
  }

  function ensureHistory(index, html = null) {
    const currentHtml = html !== null ? html : getEditorHtml(index);

    if (!historyRefs.current[index]) {
      historyRefs.current[index] = [currentHtml];
      historyIndexRefs.current[index] = 0;
    }

    return historyRefs.current[index];
  }

  function recordEditorHistory(index, html = null) {
    if (historyApplyingRef.current) return;

    const currentHtml = html !== null ? html : getEditorHtml(index);
    const history = ensureHistory(index, currentHtml);
    const currentIndex = historyIndexRefs.current[index] ?? 0;

    if (history[currentIndex] === currentHtml) return;

    // Any new edit after an undo creates a new branch.
    const nextHistory = history.slice(0, currentIndex + 1);
    nextHistory.push(currentHtml);

    // Keep the editor history manageable.
    if (nextHistory.length > 100) {
      nextHistory.shift();
    }

    historyRefs.current[index] = nextHistory;
    historyIndexRefs.current[index] = nextHistory.length - 1;
  }

  function restoreHistorySnapshot(index, targetIndex) {
    const editor = editorRefs.current[index];
    const history = historyRefs.current[index];

    if (!editor || !history) return;
    if (targetIndex < 0 || targetIndex >= history.length) return;

    const html = history[targetIndex];

    historyApplyingRef.current = true;
    historyIndexRefs.current[index] = targetIndex;
    editor.innerHTML = html;

    selectionRefs.current[index] = null;

    updateEditorSection(index, html);

    // Let the next input event create a normal history entry again.
    requestAnimationFrame(() => {
      historyApplyingRef.current = false;
      editor.focus();
    });
  }

  function undoEditor(index) {
    const editor = editorRefs.current[index];
    if (!editor) return;

    const currentHtml = getEditorHtml(index);
    ensureHistory(index, currentHtml);

    // If something changed without going through our history listener,
    // capture it before undoing.
    const history = historyRefs.current[index];
    const currentIndex = historyIndexRefs.current[index] ?? 0;
    if (history[currentIndex] !== currentHtml) {
      recordEditorHistory(index, currentHtml);
    }

    const updatedIndex = historyIndexRefs.current[index] ?? 0;
    if (updatedIndex <= 0) return;

    restoreHistorySnapshot(index, updatedIndex - 1);
  }

  function redoEditor(index) {
    const editor = editorRefs.current[index];
    if (!editor) return;

    const history = historyRefs.current[index];
    if (!history) return;

    const currentHtml = getEditorHtml(index);
    const currentIndex = historyIndexRefs.current[index] ?? 0;

    if (history[currentIndex] !== currentHtml) {
      recordEditorHistory(index, currentHtml);
      return;
    }

    if (currentIndex >= history.length - 1) return;

    restoreHistorySnapshot(index, currentIndex + 1);
  }

  function runEditorCommand(index, command, value = null) {
    const editor = editorRefs.current[index];
    if (!editor) return;

    const restored = restoreEditorSelection(index);

    if (!restored) {
      editor.focus();
      return;
    }

    try {
      editor.focus();

      let success = false;

      if (command === "hiliteColor") {
        success =
          document.execCommand("hiliteColor", false, value) ||
          document.execCommand("backColor", false, value);
      } else {
        success = document.execCommand(command, false, value);
      }

      if (!success) {
        console.warn(`Formatting command "${command}" was not applied.`);
      }

      saveEditorSelection(index);
      const html = getEditorHtml(index);
      updateEditorSection(index, html);
      recordEditorHistory(index, html);
    } catch (err) {
      console.error("Formatting command failed:", err);
    }
  }

  function wrapSelectionInCircle(index) {
    const editor = editorRefs.current[index];
    if (!editor) return;

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const liveRange = selection.getRangeAt(0);

    if (
      selection.isCollapsed ||
      !editor.contains(liveRange.commonAncestorContainer)
    ) {
      return;
    }

    try {
      const range = liveRange.cloneRange();
      const circle = document.createElement("span");

      circle.className = "writer-text-circle";

      // Inline styling makes the circle work even if the global
      // stylesheet has not loaded the circle rule yet.
      circle.style.display = "inline-block";
      circle.style.position = "relative";
      circle.style.padding = "0.02em 0.28em 0.08em";
      circle.style.border = "1.5px solid currentColor";
      circle.style.borderRadius =
        "48% 52% 46% 54% / 52% 45% 55% 48%";
      circle.style.lineHeight = "1.25";

      const contents = range.extractContents();
      circle.appendChild(contents);
      range.insertNode(circle);

      const newRange = document.createRange();
      newRange.selectNodeContents(circle);

      selection.removeAllRanges();
      selection.addRange(newRange);

      selectionRefs.current[index] = newRange.cloneRange();

      const html = getEditorHtml(index);
      updateEditorSection(index, html);
      recordEditorHistory(index, html);
    } catch (err) {
      console.error("Circle formatting failed:", err);
    }
  }

  function removeCircle(index) {
    const editor = editorRefs.current[index];
    if (!editor) return;

    const restored = restoreEditorSelection(index);
    if (!restored) {
      editor.focus();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    const circles = [];
    const closestCircle = node?.closest?.(".writer-text-circle");

    if (closestCircle && editor.contains(closestCircle)) {
      circles.push(closestCircle);
    } else if (!selection.isCollapsed) {
      editor.querySelectorAll(".writer-text-circle").forEach((circle) => {
        try {
          if (range.intersectsNode(circle)) circles.push(circle);
        } catch {
          // Ignore detached nodes.
        }
      });
    }

    if (!circles.length) return;

    try {
      circles.forEach((circle) => {
        const parent = circle.parentNode;
        if (!parent) return;

        while (circle.firstChild) {
          parent.insertBefore(circle.firstChild, circle);
        }
        parent.removeChild(circle);
      });

      const html = getEditorHtml(index);
      updateEditorSection(index, html);
      recordEditorHistory(index, html);
    } catch (err) {
      console.error("Could not remove circle:", err);
    }
  }

  function removeFormatting(index) {
    const editor = editorRefs.current[index];
    if (!editor) return;

    const restored = restoreEditorSelection(index);
    if (!restored) {
      editor.focus();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (selection.isCollapsed || !editor.contains(range.commonAncestorContainer)) {
      return;
    }

    try {
      document.execCommand("removeFormat", false, null);

      // removeFormat does not reliably remove our custom circle span,
      // so unwrap any selected circle elements as well.
      const circles = Array.from(
        editor.querySelectorAll(".writer-text-circle")
      );

      circles.forEach((circle) => {
        if (range.intersectsNode(circle)) {
          const parent = circle.parentNode;
          while (circle.firstChild) {
            parent.insertBefore(circle.firstChild, circle);
          }
          parent.removeChild(circle);
        }
      });

      saveEditorSelection(index);
      const html = getEditorHtml(index);
      updateEditorSection(index, html);
      recordEditorHistory(index, html);
    } catch (err) {
      console.error("Could not remove formatting:", err);
    }
  }

  function handleEditorKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      const index = Number(event.currentTarget.dataset.sectionIndex);
      runEditorCommand(index, "bold");
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "u") {
      event.preventDefault();
      const index = Number(event.currentTarget.dataset.sectionIndex);
      runEditorCommand(index, "underline");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bodyToEditorHtml(value) {
    const text = String(value || "");

    if (!text.trim()) return "";

    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }

    return text
      .split(/\n{2,}/)
      .map((paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`
      )
      .join("");
  }

  // =========================================================
  // STORY SECTIONS
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
  // DIGITAL MARGINALIA
  // =========================================================

  function addMarginalia() {
    setForm((current) => {
      const existing =
        current.marginalia || [];

      return {
        ...current,

        marginalia: [
          ...existing,
          {
            ...emptyMarginalia,
            position:
              existing.length + 1,
          },
        ],
      };
    });
  }

  function updateMarginalia(
    index,
    field,
    value
  ) {
    setForm((current) => ({
      ...current,

      marginalia: (
        current.marginalia || []
      ).map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  }

  function deleteMarginalia(index) {
    setForm((current) => {
      const notes = (
        current.marginalia || []
      )
        .filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
        .map((item, itemIndex) => ({
          ...item,
          position: itemIndex + 1,
        }));

      return {
        ...current,
        marginalia: notes,
      };
    });
  }

  function moveMarginalia(
    index,
    direction
  ) {
    setForm((current) => {
      const notes = [
        ...(current.marginalia || []),
      ];

      const newIndex =
        index + direction;

      if (
        newIndex < 0 ||
        newIndex >= notes.length
      ) {
        return current;
      }

      [
        notes[index],
        notes[newIndex],
      ] = [
        notes[newIndex],
        notes[index],
      ];

      return {
        ...current,

        marginalia: notes.map(
          (item, itemIndex) => ({
            ...item,
            position:
              itemIndex + 1,
          })
        ),
      };
    });
  }

  // =========================================================
  // THE RECEIPTS
  // =========================================================

  function addReceipt() {
    setForm((current) => ({
      ...current,
      receipts: [
        ...(current.receipts || []),
        {
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: "SOURCE",
          title: "",
          description: "",
          source_url: "",
          image_url: "",
          author: "",
          publication: "",
          published_date: "",
          sort_order: (current.receipts || []).length,
        },
      ],
    }));
  }

  function updateReceipt(index, field, value) {
    setForm((current) => ({
      ...current,
      receipts: (current.receipts || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function deleteReceipt(index) {
    setForm((current) => ({
      ...current,
      receipts: (current.receipts || [])
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sort_order: itemIndex })),
    }));
  }

  function moveReceipt(index, direction) {
    setForm((current) => {
      const receipts = [...(current.receipts || [])];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= receipts.length) return current;

      [receipts[index], receipts[newIndex]] = [
        receipts[newIndex],
        receipts[index],
      ];

      return {
        ...current,
        receipts: receipts.map((item, itemIndex) => ({
          ...item,
          sort_order: itemIndex,
        })),
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
          ?.toLowerCase() || "jpg";

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
          .replace(
            /[^a-z0-9-]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            "");

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
      // CLEAN MARGINALIA
      // -----------------------------------------------------

      const cleanedMarginalia =
        (form.marginalia || [])
          .map((item, index) => ({
            note:
              item?.note?.trim() ||
              "",

            type:
              item?.type ||
              "THOUGHT",

            position:
              index + 1,

            link:
              item?.link?.trim() ||
              null,
          }))
          .filter(
            (item) =>
              item.note
          );

      // -----------------------------------------------------
      // CLEAN RECEIPTS
      // -----------------------------------------------------

      const cleanedReceipts =
        (form.receipts || [])
          .map((item, index) => ({
            type: item?.type?.trim() || "SOURCE",
            title: item?.title?.trim() || "",
            description: item?.description?.trim() || "",
            source_url: item?.source_url?.trim() || null,
            image_url: item?.image_url?.trim() || null,
            author: item?.author?.trim() || "",
            publication: item?.publication?.trim() || "",
            published_date: item?.published_date?.trim() || "",
            sort_order: index,
          }))
          .filter(
            (item) =>
              item.title ||
              item.description ||
              item.source_url ||
              item.image_url
          );

      // -----------------------------------------------------
      // SECRET CODE
      // -----------------------------------------------------

      const secretCode =
        form.secret
          ? form.secret_code
              .trim()
              .toUpperCase() ||
            null
          : null;

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

        // ---------------------------------------------------
        // SECRET ARTICLE FIELDS
        // ---------------------------------------------------

        secret:
          Boolean(form.secret),

        secret_code:
          secretCode,

        // ---------------------------------------------------
        // DIGITAL MARGINALIA
        // ---------------------------------------------------

        marginalia:
          cleanedMarginalia,
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

        // ---------------------------------------------------
        // SAVE RECEIPTS
        // ---------------------------------------------------

        const { error: deleteReceiptsError } = await supabase
          .from("article_receipts")
          .delete()
          .eq("article_id", updatedArticle.id);

        if (deleteReceiptsError) {
          throw deleteReceiptsError;
        }

        if (cleanedReceipts.length > 0) {
          const receiptRows = cleanedReceipts.map((receipt, index) => ({
            article_id: updatedArticle.id,
            type: receipt.type,
            title: receipt.title,
            description: receipt.description || null,
            source_url: receipt.source_url,
            image_url: receipt.image_url,
            author: receipt.author || null,
            publication: receipt.publication || null,
            published_date: receipt.published_date || null,
            sort_order: index,
          }));

          const { error: receiptInsertError } = await supabase
            .from("article_receipts")
            .insert(receiptRows);

          if (receiptInsertError) {
            throw receiptInsertError;
          }
        }

        setForm((current) => ({
          ...current,

          slug:
            updatedArticle.slug,

          published:
            Boolean(
              updatedArticle.published
            ),

          secret:
            Boolean(
              updatedArticle.secret
            ),

          secret_code:
            updatedArticle.secret_code ||
            "",

          sections:
            cleanedSections.length
              ? cleanedSections
              : [{ ...emptySection }],

          marginalia:
            cleanedMarginalia,

          receipts:
            cleanedReceipts,
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

      // -----------------------------------------------------
      // SAVE RECEIPTS
      // -----------------------------------------------------

      if (cleanedReceipts.length > 0) {
        const receiptRows = cleanedReceipts.map((receipt, index) => ({
          article_id: newArticle.id,
          type: receipt.type,
          title: receipt.title,
          description: receipt.description || null,
          source_url: receipt.source_url,
          image_url: receipt.image_url,
          author: receipt.author || null,
          publication: receipt.publication || null,
          published_date: receipt.published_date || null,
          sort_order: index,
        }));

        const { error: receiptInsertError } = await supabase
          .from("article_receipts")
          .insert(receiptRows);

        if (receiptInsertError) {
          throw receiptInsertError;
        }
      }

      setForm((current) => ({
        ...current,

        slug:
          newArticle.slug,

        published:
          Boolean(
            newArticle.published
          ),

        secret:
          Boolean(
            newArticle.secret
          ),

        secret_code:
          newArticle.secret_code ||
          "",

        sections:
          cleanedSections.length
            ? cleanedSections
            : [{ ...emptySection }],

        marginalia:
          cleanedMarginalia,

        receipts:
          cleanedReceipts,
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

                      <div className="writer-rich-editor">

                        <div className="writer-format-toolbar">

                          <div className="writer-format-group">
                            <button
                              type="button"
                              className="writer-format-button writer-format-bold"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                saveEditorSelection(index);
                              }}
                              onClick={() => runEditorCommand(index, "bold")}
                              title="Bold"
                              aria-label="Bold"
                            >
                              B
                            </button>

                            <button
                              type="button"
                              className="writer-format-button writer-format-underline"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                saveEditorSelection(index);
                              }}
                              onClick={() => runEditorCommand(index, "underline")}
                              title="Underline"
                              aria-label="Underline"
                            >
                              U
                            </button>

                            <button
                              type="button"
                              className="writer-format-button writer-format-circle"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                wrapSelectionInCircle(index);
                              }}
                              title="Circle selected text"
                              aria-label="Circle selected text"
                            >
                              ◯
                            </button>

                            <button
                              type="button"
                              className="writer-format-button writer-format-uncircle"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                saveEditorSelection(index);
                              }}
                              onClick={() => removeCircle(index)}
                              title="Remove circle"
                              aria-label="Remove circle"
                            >
                              ⊖
                            </button>

                            <button
                              type="button"
                              className="writer-format-button writer-format-highlight"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                saveEditorSelection(index);
                              }}
                              onClick={() =>
                                runEditorCommand(
                                  index,
                                  "hiliteColor",
                                  highlightColors.yellow
                                )
                              }
                              title="Highlight with yellow"
                              aria-label="Highlight with yellow"
                            >
                              ✦
                            </button>

                            <button
                              type="button"
                              className="writer-format-button writer-format-history"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                saveEditorSelection(index);
                              }}
                              onClick={() => undoEditor(index)}
                              title="Undo last edit"
                              aria-label="Undo last edit"
                            >
                              ↶
                            </button>

                            <button
                              type="button"
                              className="writer-format-button writer-format-history"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                saveEditorSelection(index);
                              }}
                              onClick={() => redoEditor(index)}
                              title="Redo edit"
                              aria-label="Redo edit"
                            >
                              ↷
                            </button>

                            <button
                              type="button"
                              className="writer-format-button writer-format-clear"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                saveEditorSelection(index);
                              }}
                              onClick={() => removeFormatting(index)}
                              title="Clear formatting"
                              aria-label="Clear formatting"
                            >
                              Tx
                            </button>
                          </div>

                          <div className="writer-format-divider" />

                          <div className="writer-format-colors">
                            <span className="writer-format-label">COLOR</span>

                            {Object.entries(editorialColors).map(([name, color]) => (
                              <div className="writer-color-pair" key={`text-${name}`}>
                                <button
                                  type="button"
                                  className="writer-color-swatch"
                                  style={{ "--swatch": color }}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    saveEditorSelection(index);
                                  }}
                                  onClick={() => runEditorCommand(index, "foreColor", color)}
                                  title={`Text color: ${name}`}
                                  aria-label={`Text color: ${name}`}
                                >
                                  A
                                </button>
                              </div>
                            ))}

                            {Object.entries(highlightColors).map(([name, color]) => (
                              <div className="writer-color-pair" key={`highlight-${name}`}>
                                <button
                                  type="button"
                                  className="writer-highlight-swatch"
                                  style={{
                                    "--swatch": color,
                                    backgroundColor: color,
                                  }}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    saveEditorSelection(index);
                                  }}
                                  onClick={() => runEditorCommand(index, "hiliteColor", color)}
                                  title={`Highlight color: ${name}`}
                                  aria-label={`Highlight color: ${name}`}
                                >
                                  H
                                </button>
                              </div>
                            ))}
                          </div>

                        </div>

                        <div
                          ref={(element) => {
                            editorRefs.current[index] = element;
                          }}
                          className="writer-body-input writer-rich-text"
                          contentEditable
                          suppressContentEditableWarning
                          data-section-index={index}
                          data-placeholder="Start writing here..."
                          dangerouslySetInnerHTML={{
                            __html: bodyToEditorHtml(section.body),
                          }}
                          onInput={() => updateEditorSection(index)}
                          onMouseUp={() => saveEditorSelection(index)}
                          onKeyUp={() => saveEditorSelection(index)}
                          onFocus={() => saveEditorSelection(index)}
                          onKeyDown={handleEditorKeyDown}
                          aria-label={`Section ${
                            index + 1
                          } body`}
                          role="textbox"
                        />

                        <div className="writer-format-help">
                          SELECT TEXT → BOLD / UNDERLINE / CIRCLE / HIGHLIGHT / COLOR
                        </div>

                      </div>

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

          {/* =================================================
              SECRET ARTICLE
              ================================================= */}

          <section
            className={`writer-sidebar-card writer-secret-card ${
              form.secret
                ? "is-secret"
                : ""
            }`}
          >

            <div className="writer-sidebar-title">
              <span>
                SECRET ARTICLE
              </span>

              <LockKeyhole
                size={15}
              />
            </div>

            <div className="writer-secret-toggle">

              <div className="writer-secret-toggle-copy">

                <strong>
                  CURIOUSLY SECRET
                </strong>

                <span>
                  Hide this story from the
                  normal magazine.
                </span>

              </div>

              <button
                type="button"
                className={`writer-secret-switch ${
                  form.secret
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateField(
                    "secret",
                    !form.secret
                  )
                }
                aria-pressed={
                  form.secret
                }
                aria-label="Toggle secret article"
              >
                <span />
              </button>

            </div>

            {form.secret && (
              <div className="writer-secret-details">

                <div className="writer-secret-status">
                  <span>
                    ✦
                  </span>

                  THIS ARTICLE IS HIDDEN
                </div>

                <label className="writer-field">

                  <span>
                    SECRET CODE
                    <small>
                      OPTIONAL
                    </small>
                  </span>

                  <input
                    value={
                      form.secret_code
                    }
                    onChange={(event) =>
                      updateField(
                        "secret_code",
                        event.target.value
                      )
                    }
                    placeholder="SECRET-001"
                    autoComplete="off"
                  />

                </label>

                <p className="writer-secret-help">
                  Readers can only reach this
                  article through a secret clue
                  or direct link.
                </p>

              </div>
            )}

          </section>

          {/* =================================================
              DIGITAL MARGINALIA
              ================================================= */}

          <section className="writer-sidebar-card writer-marginalia-card">

            <div className="writer-sidebar-title writer-marginalia-heading">

              <span>
                DIGITAL MARGINALIA
              </span>

              <span className="writer-marginalia-count">
                {(
                  form.marginalia || []
                ).length}
              </span>

            </div>

            <p className="writer-marginalia-description">
              Little editorial thoughts that
              appear beside the story.
            </p>

            <button
              type="button"
              className="writer-add-marginalia"
              onClick={
                addMarginalia
              }
            >
              <Plus size={15} />
              ADD NOTE
            </button>

            {(
              form.marginalia || []
            ).length > 0 && (
              <div className="writer-marginalia-list">

                {form.marginalia.map(
                  (item, index) => (
                    <div
                      className="writer-marginalia-item"
                      key={index}
                    >

                      {/* NOTE HEADER */}

                      <div className="writer-marginalia-item-top">

                        <span className="writer-marginalia-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <div className="writer-marginalia-order">

                          <button
                            type="button"
                            onClick={() =>
                              moveMarginalia(
                                index,
                                -1
                              )
                            }
                            disabled={
                              index ===
                              0
                            }
                            aria-label="Move note up"
                            title="Move up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveMarginalia(
                                index,
                                1
                              )
                            }
                            disabled={
                              index ===
                              form
                                .marginalia
                                .length -
                                1
                            }
                            aria-label="Move note down"
                            title="Move down"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="writer-marginalia-delete"
                            onClick={() =>
                              deleteMarginalia(
                                index
                              )
                            }
                            aria-label="Delete note"
                            title="Delete note"
                          >
                            <Trash2
                              size={13}
                            />
                          </button>

                        </div>

                      </div>

                      {/* NOTE */}

                      <label className="writer-field">

                        <span>
                          NOTE
                        </span>

                        <textarea
                          value={
                            item.note ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateMarginalia(
                              index,
                              "note",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="This sent me down a rabbit hole..."
                          rows="3"
                        />

                      </label>

                      {/* TYPE */}

                      <label className="writer-field">

                        <span>
                          TYPE
                        </span>

                        <select
                          value={
                            item.type ||
                            "THOUGHT"
                          }
                          onChange={(
                            event
                          ) =>
                            updateMarginalia(
                              index,
                              "type",
                              event
                                .target
                                .value
                            )
                          }
                        >

                          <option value="THOUGHT">
                            THOUGHT
                          </option>

                          <option value="RABBIT HOLE">
                            RABBIT HOLE
                          </option>

                          <option value="EDITORIAL NOTE">
                            EDITORIAL NOTE
                          </option>

                          <option value="LOOK">
                            LOOK
                          </option>

                          <option value="OBSESSION">
                            OBSESSION
                          </option>

                        </select>

                      </label>

                      {/* LINK */}

                      <label className="writer-field">

                        <span>
                          LINK
                          <small>
                            OPTIONAL
                          </small>
                        </span>

                        <input
                          type="text"
                          value={
                            item.link ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateMarginalia(
                              index,
                              "link",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="/article/another-story"
                        />

                      </label>

                    </div>
                  )
                )}

              </div>
            )}

            {(
              form.marginalia || []
            ).length === 0 && (
              <div className="writer-marginalia-empty">
                <span>
                  ✎
                </span>

                <p>
                  No notes yet.
                  <br />
                  Add one when you have a
                  thought worth leaving in
                  the margin.
                </p>
              </div>
            )}

          </section>

          {/* =================================================
              THE RECEIPTS
              ================================================= */}

          <section className="writer-sidebar-card writer-receipts-card">

            <div className="writer-sidebar-title writer-receipts-heading">
              <span>THE RECEIPTS</span>
              <span className="writer-receipts-count">
                {(form.receipts || []).length}
              </span>
            </div>

            <p className="writer-receipts-description">
              Sources, data, screenshots, books, links &amp; other evidence behind the story.
            </p>

            <button
              type="button"
              className="writer-add-marginalia"
              onClick={addReceipt}
            >
              <Plus size={15} />
              ADD RECEIPT
            </button>

            {(form.receipts || []).length > 0 && (
              <div className="writer-receipts-list">
                {form.receipts.map((receipt, index) => (
                  <div
                    className="writer-receipt-item"
                    key={receipt.id || index}
                  >
                    <div className="writer-receipt-item-top">
                      <span className="writer-receipt-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="writer-receipt-order">
                        <button
                          type="button"
                          onClick={() => moveReceipt(index, -1)}
                          disabled={index === 0}
                          aria-label="Move receipt up"
                        >↑</button>
                        <button
                          type="button"
                          onClick={() => moveReceipt(index, 1)}
                          disabled={index === form.receipts.length - 1}
                          aria-label="Move receipt down"
                        >↓</button>
                        <button
                          type="button"
                          className="writer-marginalia-delete"
                          onClick={() => deleteReceipt(index)}
                          aria-label="Delete receipt"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <label className="writer-field">
                      <span>TYPE</span>
                      <select
                        value={receipt.type || "SOURCE"}
                        onChange={(event) => updateReceipt(index, "type", event.target.value)}
                      >
                        <option value="SOURCE">SOURCE</option>
                        <option value="DATA">DATA</option>
                        <option value="SCREENSHOT">SCREENSHOT</option>
                        <option value="BOOK">BOOK</option>
                        <option value="ARTICLE">ARTICLE</option>
                        <option value="VIDEO">VIDEO</option>
                        <option value="ARCHIVE">ARCHIVE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </label>

                    <label className="writer-field">
                      <span>TITLE</span>
                      <input
                        value={receipt.title || ""}
                        onChange={(event) => updateReceipt(index, "title", event.target.value)}
                        placeholder="The source, book, dataset..."
                      />
                    </label>

                    <label className="writer-field">
                      <span>DESCRIPTION <small>OPTIONAL</small></span>
                      <textarea
                        value={receipt.description || ""}
                        onChange={(event) => updateReceipt(index, "description", event.target.value)}
                        placeholder="What is this evidence?"
                        rows="3"
                      />
                    </label>

                    <label className="writer-field">
                      <span>SOURCE LINK <small>OPTIONAL</small></span>
                      <input
                        type="url"
                        value={receipt.source_url || ""}
                        onChange={(event) => updateReceipt(index, "source_url", event.target.value)}
                        placeholder="https://..."
                      />
                    </label>

                    <label className="writer-field">
                      <span>IMAGE URL <small>OPTIONAL</small></span>
                      <input
                        type="url"
                        value={receipt.image_url || ""}
                        onChange={(event) => updateReceipt(index, "image_url", event.target.value)}
                        placeholder="https://..."
                      />
                    </label>

                    <label className="writer-field">
                      <span>AUTHOR <small>OPTIONAL</small></span>
                      <input
                        value={receipt.author || ""}
                        onChange={(event) => updateReceipt(index, "author", event.target.value)}
                        placeholder="Author name"
                      />
                    </label>

                    <label className="writer-field">
                      <span>PUBLICATION <small>OPTIONAL</small></span>
                      <input
                        value={receipt.publication || ""}
                        onChange={(event) => updateReceipt(index, "publication", event.target.value)}
                        placeholder="Publication, institution..."
                      />
                    </label>

                    <label className="writer-field">
                      <span>DATE <small>OPTIONAL</small></span>
                      <input
                        value={receipt.published_date || ""}
                        onChange={(event) => updateReceipt(index, "published_date", event.target.value)}
                        placeholder="September 2026"
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {(form.receipts || []).length === 0 && (
              <div className="writer-marginalia-empty writer-receipts-empty">
                <span>⌁</span>
                <p>
                  No receipts yet.
                  <br />
                  Add the evidence behind this story.
                </p>
              </div>
            )}

          </section>

          {/* =================================================
              COVER
              ================================================= */}

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

          {/* =================================================
              WRITING TIP
              ================================================= */}

          <section className="writer-sidebar-card writer-tip">

            <div className="writer-sidebar-title">
              WRITING NOTE
            </div>

            <p>
              Don't worry about making every
              section perfect. Get the thought
              down first. You can always come back
              and edit.
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