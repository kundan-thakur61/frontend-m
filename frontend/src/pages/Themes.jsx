import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import collectionAPI from '../api/collectionAPI';
import { resolveImageUrl } from '../utils/helpers';
import { FALLBACK_COLLECTIONS } from '../data/fallbackCollections';

const DEFAULT_ACCENT = '#0ea5e9';
const DEFAULT_TAGLINE = 'Fresh drop';
const FALLBACK_CARDS = FALLBACK_COLLECTIONS.map((collection) => ({
  id: collection._id,
  handle: collection.handle,
  title: collection.title,
  image: resolveImageUrl(collection.heroImage || collection.images?.[0]?.url),
  tagline: collection.tagline || DEFAULT_TAGLINE,
  accent: collection.accentColor || DEFAULT_ACCENT,
}));
const IMAGE_ERROR_FALLBACK = FALLBACK_CARDS[0]?.image || '/frames/frame-1-fixed.svg';

const Themes = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const res = await collectionAPI.listPublic();
        if (!ignore) {
          setCollections(res?.data?.data?.collections || []);
        }
      } catch (err) {
        if (!ignore) setCollections([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchCollections();
    return () => {
      ignore = true;
    };
  }, []);

  // build card objects: use heroImage only, or fallback tile (ignore uploaded collection images)
  const cards = (collections.length
    ? collections.map((item, idx) => {
        const hero = resolveImageUrl(item?.heroImage);
        const fallback = FALLBACK_CARDS[idx % FALLBACK_CARDS.length];
        return {
          id: item._id || `${item.handle || `c-${idx}`}`,
          handle: item.handle || item._id || fallback?.handle || `${idx}`,
          title: item.title || fallback?.title || 'Untitled',
          image: hero || fallback?.image,
          accent: item.accentColor || fallback?.accent || DEFAULT_ACCENT,
          tagline: item.tagline || fallback?.tagline || DEFAULT_TAGLINE,
        };
      })
    : FALLBACK_CARDS
  );

  // Helper for img onError to show a safe fallback instead of broken image icon
  const handleImgError = (e) => {
    if (e?.target) {
      e.target.onerror = null;
      e.target.src = IMAGE_ERROR_FALLBACK;
    }
  };

  const handleKeyDown = (e, handle) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/collection/${handle}`);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white/25 rounded-4xl p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading && collections.length === 0 ? (
            FALLBACK_CARDS.map((tile) => (
              <div
                key={tile.handle}
                className="rounded-3xl h-64 bg-gray-200 animate-pulse"
                aria-hidden="true"
              />
            ))
          ) : (
            cards.map((card) => (
              <Link
                key={card.id}
                to={`/collection/${card.handle}`}
                className="group relative rounded-3xl overflow-hidden h-64 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                aria-label={`${card.title} — ${card.tagline}`}
                onKeyDown={(e) => handleKeyDown(e, card.handle)}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  onError={handleImgError}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                  {/* <p className="text-xs uppercase tracking-[0.3em] text-white/70">Collection</p>
                  <h3 className="text-2xl font-semibold mt-2">{card.title}</h3>
                  <p className="text-sm text-white/80 mt-1">{card.tagline}</p> */}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Themes;
