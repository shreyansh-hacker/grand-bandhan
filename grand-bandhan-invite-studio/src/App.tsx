import React, { useState, useEffect } from 'react';
import { EventCategory, InvitationDraft } from './types/invitation';
import { TemplateCatalogEntry, TEMPLATE_CATALOG } from './templates/catalog';
import { loadSavedDraft, saveDraft, createInitialDraft, getAllDrafts, publishDraft, checkCanPublish } from './services/storage';
import { EventSelection } from './pages/EventSelection';
import { Gallery } from './pages/Gallery';
import { Demo } from './pages/Demo';
import { Studio } from './pages/Studio';
import { GuestPreview } from './pages/GuestPreview';
import { Dashboard } from './pages/Dashboard';
import { PublishedGuestPage } from './pages/PublishedGuestPage';
import { LanguageProvider } from './locales';

type StudioView = 'events' | 'gallery' | 'demo' | 'studio' | 'preview' | 'dashboard' | 'published';

export const AppContent: React.FC = () => {
  const [view, setView] = useState<StudioView>('events');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('wedding');
  const [demoTemplate, setDemoTemplate] = useState<TemplateCatalogEntry>(TEMPLATE_CATALOG[0]);
  const [currentDraft, setCurrentDraft] = useState<InvitationDraft>(() => loadSavedDraft());
  const [guestSlug, setGuestSlug] = useState<string>('kabir-meera-wedding');

  // Check URL pathname and hash on initial mount and route changes
  useEffect(() => {
    const handleRouting = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      // Check for /i/<slug> in pathname or hash
      const pathMatch = pathname.match(/\/i\/([^/?#]+)/);
      const hashMatch = hash.match(/#\/i\/([^/?#]+)/);

      if (pathMatch && pathMatch[1]) {
        setGuestSlug(pathMatch[1]);
        setView('published');
        return;
      }

      if (hashMatch && hashMatch[1]) {
        setGuestSlug(hashMatch[1]);
        setView('published');
        return;
      }

      if (hash === '#/dashboard') {
        setView('dashboard');
      } else if (hash === '#/studio') {
        setView('studio');
      } else if (hash === '#/preview') {
        setView('preview');
      } else if (hash === '#/demo') {
        setView('demo');
      } else if (hash === '#/gallery') {
        setView('gallery');
      } else if (hash === '#/events' || hash === '' || hash === '#/') {
        setView('events');
      }
    };

    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('popstate', handleRouting);
    return () => {
      window.removeEventListener('hashchange', handleRouting);
      window.removeEventListener('popstate', handleRouting);
    };
  }, []);

  const navigateTo = (newView: StudioView, extraHash = '') => {
    setView(newView);
    if (newView === 'published') {
      window.location.hash = `#/i/${extraHash || guestSlug}`;
    } else {
      window.location.hash = `#/${newView}`;
    }
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans text-[#2c2523] selection:bg-[#6e1f2f] selection:text-white">
      {/* 1. Event Selection Screen */}
      {view === 'events' && (
        <EventSelection
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            navigateTo('gallery');
          }}
          onOpenDashboard={() => navigateTo('dashboard')}
        />
      )}

      {/* 2. Gallery Screen */}
      {view === 'gallery' && (
        <Gallery
          selectedCategory={selectedCategory}
          onBackToEvents={() => navigateTo('events')}
          onViewDemo={(tmpl) => {
            setDemoTemplate(tmpl);
            navigateTo('demo');
          }}
          onUseTemplate={(tmpl) => {
            // Find existing draft for this template or create independent draft
            const all = getAllDrafts();
            const existing = all.find((d) => d.templateId === tmpl.id);
            if (existing) {
              setCurrentDraft(existing);
              saveDraft(existing);
            } else {
              const fresh = createInitialDraft(tmpl.id);
              setCurrentDraft(fresh);
            }
            navigateTo('studio');
          }}
          onSelectCategoryFilter={(cat) => setSelectedCategory(cat)}
          onOpenDashboard={() => navigateTo('dashboard')}
        />
      )}

      {/* 3. Demo Screen (Original untouched template) */}
      {view === 'demo' && (
        <Demo
          template={demoTemplate}
          onBackToGallery={() => navigateTo('gallery')}
          onUseTemplate={(tmpl) => {
            const all = getAllDrafts();
            const existing = all.find((d) => d.templateId === tmpl.id);
            if (existing) {
              setCurrentDraft(existing);
              saveDraft(existing);
            } else {
              const fresh = createInitialDraft(tmpl.id);
              setCurrentDraft(fresh);
            }
            navigateTo('studio');
          }}
        />
      )}

      {/* 4. Visual Studio Editor */}
      {view === 'studio' && (
        <Studio
          initialDraft={currentDraft}
          onBackToGallery={() => navigateTo('gallery')}
          onOpenGuestPreview={(draftToPreview) => {
            setCurrentDraft(draftToPreview);
            saveDraft(draftToPreview);
            navigateTo('preview');
          }}
          onOpenDashboard={() => navigateTo('dashboard')}
        />
      )}

      {/* 5. Guest Preview (Plays the edited invitation from beginning) */}
      {view === 'preview' && (
        <GuestPreview
          draft={currentDraft}
          onBackToStudio={() => navigateTo('studio')}
          onPublishDraft={() => {
            const check = checkCanPublish(currentDraft.id);
            if (!check.allowed) {
              alert(check.reason);
              navigateTo('dashboard');
              return;
            }
            const published = publishDraft(currentDraft);
            setCurrentDraft({ ...published });
            alert(`Invitation published live! Accessible at /i/${published.slug}`);
          }}
        />
      )}

      {/* 6. Dashboard (Organiser project overview, drafts & live RSVPs) */}
      {view === 'dashboard' && (
        <Dashboard
          onBackToStudio={() => navigateTo('studio')}
          onOpenDraft={(d) => {
            setCurrentDraft(d);
            saveDraft(d);
            navigateTo('studio');
          }}
          onCreateNew={() => navigateTo('events')}
          onPreviewDraft={(d) => {
            setCurrentDraft(d);
            saveDraft(d);
            navigateTo('preview');
          }}
        />
      )}

      {/* 7. Published Guest Page (/i/:slug) */}
      {view === 'published' && (
        <PublishedGuestPage
          slug={guestSlug}
          onGoHome={() => navigateTo('events')}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
