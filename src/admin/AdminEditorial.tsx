import { useMemo, useState } from 'react'
import {
  BookOpen,
  Check,
  Clock,
  Download,
  Eye,
  Image as ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import type { BlogPost } from '../types'
import { imageLibrary } from '../data/data'
import { downloadCsv, slugify } from './adminUtils'
import {
  AdminConfirm,
  AdminEmpty,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from './components'

const PAGE_SIZE = 7

type PostForm = {
  title: string
  category: string
  excerpt: string
  image: string
  readTime: string
  date: string
  author: string
  authorRole: string
  status: BlogPost['status']
  content: string
  pullQuote: string
}

const todayLabel = () =>
  new Intl.DateTimeFormat('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

const emptyForm = (): PostForm => ({
  title: '',
  category: 'Inspiration',
  excerpt: '',
  image: '/images/kyoto.jpg',
  readTime: '5',
  date: todayLabel(),
  author: 'Camille Laurent',
  authorRole: 'Fondatrice & spécialiste parcs',
  status: 'draft',
  content: '',
  pullQuote: '',
})

export default function AdminEditorial() {
  const { blogPosts, addPost, updatePost, deletePost, notify } = useStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<PostForm>(emptyForm())
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null)

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      if (status !== 'all' && post.status !== status) return false
      if (!search.trim()) return true
      return `${post.title} ${post.category} ${post.author}`.toLowerCase().includes(search.trim().toLowerCase())
    })
  }, [blogPosts, status, search])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const categories = Array.from(new Set(blogPosts.map((post) => post.category)))

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    setForm({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      image: post.image,
      readTime: String(post.readTime),
      date: post.date,
      author: post.author,
      authorRole: post.authorRole,
      status: post.status,
      content: post.content.join('\n\n'),
      pullQuote: post.pullQuote,
    })
    setModalOpen(true)
  }

  const update = (key: keyof PostForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      notify('Le titre, l’accroche et le contenu sont nécessaires.', 'error')
      return
    }
    const paragraphs = form.content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.title),
      category: form.category.trim() || 'Inspiration',
      excerpt: form.excerpt.trim(),
      image: form.image,
      readTime: Math.max(1, Number(form.readTime) || 5),
      date: form.date.trim() || todayLabel(),
      author: form.author.trim() || 'Camille Laurent',
      authorRole: form.authorRole.trim() || 'L’équipe Faraway',
      status: form.status,
      content: paragraphs,
      pullQuote: form.pullQuote.trim() || form.excerpt.trim(),
    }
    if (editing) updatePost(editing.id, payload)
    else addPost(payload)
    setModalOpen(false)
  }

  const exportPosts = () => {
    downloadCsv(
      `faraway-journal-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((post) => ({
        Titre: post.title,
        Catégorie: post.category,
        Statut: post.status === 'published' ? 'Publié' : 'Brouillon',
        Auteur: post.author,
        Date: post.date,
        Lecture: `${post.readTime} min`,
      })),
    )
    notify('Articles exportés.')
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Contenus"
        title="Journal"
        description={`${blogPosts.filter((post) => post.status === 'published').length} articles publiés · ${blogPosts.filter((post) => post.status === 'draft').length} brouillons à finaliser`}
        actions={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={exportPosts}>
              <Download /> Exporter
            </button>
            <button className="admin-btn admin-btn--primary" onClick={openCreate}>
              <Plus /> Écrire un article
            </button>
          </>
        }
      />

      <div className="admin-mini-stats">
        <div>
          <span className="admin-mini-stat__icon"><BookOpen /></span>
          <span><small>Articles publiés</small><strong>{blogPosts.filter((post) => post.status === 'published').length}</strong></span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><Pencil /></span>
          <span><small>Brouillons</small><strong>{blogPosts.filter((post) => post.status === 'draft').length}</strong></span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><Clock /></span>
          <span><small>Temps de lecture moyen</small><strong>{Math.round(blogPosts.reduce((sum, post) => sum + post.readTime, 0) / Math.max(blogPosts.length, 1))} min</strong></span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><Sparkles /></span>
          <span><small>Rubriques</small><strong>{categories.length}</strong></span>
        </div>
      </div>

      <div className="admin-toolbar">
        <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Titre, rubrique, auteur…" />
        <div className="admin-toolbar__group">
          <select className="admin-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
          {(search || status !== 'all') && (
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setSearch(''); setStatus('all') }}>
              <RotateCcw /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--posts">
            <thead>
              <tr>
                <th>Article</th>
                <th>Rubrique</th>
                <th>Auteur</th>
                <th>Date</th>
                <th>Lecture</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="admin-post-cell">
                      <img src={post.image} alt="" />
                      <span>
                        <strong>{post.title}</strong>
                        <small>{post.excerpt}</small>
                      </span>
                    </div>
                  </td>
                  <td><span className="admin-category-tag">{post.category}</span></td>
                  <td>
                    <span>{post.author}</span>
                    <small className="admin-cell-sub">{post.authorRole}</small>
                  </td>
                  <td>{post.date}</td>
                  <td>{post.readTime} min</td>
                  <td>
                    <span className={`status ${post.status === 'published' ? 'status--confirmed' : 'status--draft'}`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <a href={`/journal/${post.slug}`} target="_blank" rel="noreferrer" title="Voir sur le site" aria-label="Voir sur le site">
                        <Eye />
                      </a>
                      <button onClick={() => openEdit(post)} title="Modifier" aria-label="Modifier">
                        <Pencil />
                      </button>
                      <button
                        onClick={() =>
                          updatePost(post.id, { status: post.status === 'published' ? 'draft' : 'published' })
                        }
                        title={post.status === 'published' ? 'Repasser en brouillon' : 'Publier'}
                        aria-label={post.status === 'published' ? 'Repasser en brouillon' : 'Publier'}
                      >
                        <Send />
                      </button>
                      <button className="is-danger" onClick={() => setConfirmDelete(post)} title="Supprimer" aria-label="Supprimer">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <AdminEmpty
            title="Aucun article trouvé"
            description="Écrivez une nouvelle histoire ou modifiez vos filtres."
            action={
              <button className="admin-btn admin-btn--primary" onClick={openCreate}>
                <Plus /> Écrire un article
              </button>
            }
          />
        )}
        {filtered.length > 0 && (
          <AdminPagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} />
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier l’article' : 'Nouvel article'}
        subtitle={editing ? editing.title : 'Racontez une histoire qui donne envie de partir.'}
        size="xl"
        footer={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="admin-btn admin-btn--primary" onClick={submit}>
              {editing ? 'Enregistrer' : 'Créer l’article'} <Check />
            </button>
          </>
        }
      >
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <div className="admin-field admin-field--full">
              <label>Titre</label>
              <input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Un titre qui donne envie de lire" />
            </div>
            <div className="admin-field">
              <label>Rubrique</label>
              <input list="post-categories" value={form.category} onChange={(event) => update('category', event.target.value)} />
              <datalist id="post-categories">
                {categories.map((item) => <option key={item} value={item} />)}
              </datalist>
            </div>
            <div className="admin-field">
              <label>Statut</label>
              <select value={form.status} onChange={(event) => update('status', event.target.value)}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Auteur</label>
              <input value={form.author} onChange={(event) => update('author', event.target.value)} />
            </div>
            <div className="admin-field">
              <label>Rôle de l’auteur</label>
              <input value={form.authorRole} onChange={(event) => update('authorRole', event.target.value)} />
            </div>
            <div className="admin-field">
              <label>Date de publication</label>
              <input value={form.date} onChange={(event) => update('date', event.target.value)} />
            </div>
            <div className="admin-field">
              <label>Temps de lecture (min)</label>
              <input type="number" min="1" value={form.readTime} onChange={(event) => update('readTime', event.target.value)} />
            </div>
            <div className="admin-field admin-field--full">
              <label>Accroche</label>
              <textarea rows={2} value={form.excerpt} onChange={(event) => update('excerpt', event.target.value)} />
            </div>
          </div>

          <div className="admin-form-section">
            <span className="admin-form-section__title">Visuel de couverture</span>
            <div className="admin-image-picker">
              <div className="admin-image-preview">
                <img src={form.image} alt="Aperçu" />
                <span><ImageIcon /> Couverture</span>
              </div>
              <div className="admin-field admin-image-select">
                <label>Image</label>
                <select value={form.image} onChange={(event) => update('image', event.target.value)}>
                  {imageLibrary.map((image) => (
                    <option key={image.path} value={image.path}>{image.label}</option>
                  ))}
                </select>
                <div className="admin-image-grid">
                  {imageLibrary.slice(0, 8).map((image) => (
                    <button
                      key={image.path}
                      type="button"
                      className={form.image === image.path ? 'is-active' : ''}
                      onClick={() => update('image', image.path)}
                    >
                      <img src={image.path} alt={image.label} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <span className="admin-form-section__title">Contenu</span>
            <div className="admin-form-grid">
              <div className="admin-field admin-field--full">
                <label>Corps de l’article <small>séparez les paragraphes par une ligne vide</small></label>
                <textarea rows={10} value={form.content} onChange={(event) => update('content', event.target.value)} />
              </div>
              <div className="admin-field admin-field--full">
                <label>Citation à mettre en avant</label>
                <textarea rows={3} value={form.pullQuote} onChange={(event) => update('pullQuote', event.target.value)} />
              </div>
            </div>
          </div>
        </form>
      </AdminModal>

      <AdminConfirm
        open={Boolean(confirmDelete)}
        title="Supprimer cet article ?"
        message={`L’article « ${confirmDelete?.title ?? ''} » sera définitivement supprimé du journal.`}
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) deletePost(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />
    </div>
  )
}
