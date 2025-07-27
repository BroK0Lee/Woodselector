import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, ArrowLeft, Star, Leaf, Hammer, Shield } from 'lucide-react';
import { gsap } from 'gsap';

interface Material {
  name: string;
  image: string;
  id: string;
}

interface MaterialDetails {
  images: string[];
  characteristics: {
    density: string;
    hardness: string;
    durability: string;
    color: string;
  };
  applications: string[];
  recommendations: string[];
  description: string;
}

interface MaterialCardProps {
  name: string;
  image: string;
  material: Material;
  onSelect: () => void;
  onConfirm: (material: Material) => void;
  onBack: () => void;
  isSelected: boolean;
  isDetailedView: boolean;
}

// Données détaillées pour chaque matériau
const materialDetails: Record<string, MaterialDetails> = {
  oak: {
    images: [
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1267239/pexels-photo-1267239.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.75 g/cm³',
      hardness: 'Très dur',
      durability: 'Excellente',
      color: 'Brun doré à brun foncé'
    },
    applications: ['Parquets haut de gamme', 'Mobilier traditionnel', 'Charpente', 'Tonnellerie'],
    recommendations: ['Idéal pour les projets durables', 'Résiste bien à l\'humidité', 'Nécessite un traitement préventif'],
    description: 'Le chêne est un bois noble reconnu pour sa robustesse exceptionnelle et sa longévité. Très apprécié en ébénisterie et construction.'
  },
  walnut: {
    images: [
      'https://images.pexels.com/photos/1108573/pexels-photo-1108573.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108574/pexels-photo-1108574.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.65 g/cm³',
      hardness: 'Dur',
      durability: 'Bonne',
      color: 'Brun chocolat avec veines foncées'
    },
    applications: ['Mobilier de luxe', 'Instruments de musique', 'Décoration intérieure', 'Sculptures'],
    recommendations: ['Excellent pour le travail fin', 'Finition naturelle recommandée', 'Éviter l\'exposition directe au soleil'],
    description: 'Le noyer est prisé pour sa beauté naturelle et ses veines distinctives. Un choix premium pour les créations artistiques.'
  },
  maple: {
    images: [
      'https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.70 g/cm³',
      hardness: 'Dur',
      durability: 'Très bonne',
      color: 'Blanc crème à brun pâle'
    },
    applications: ['Parquets sportifs', 'Plans de travail', 'Mobilier moderne', 'Instruments'],
    recommendations: ['Excellent pour la teinture', 'Résistant à l\'usure', 'Facile à travailler'],
    description: 'L\'érable offre une surface lisse et uniforme, parfaite pour les finitions modernes et les applications nécessitant une grande résistance.'
  },
  pine: {
    images: [
      'https://images.pexels.com/photos/1267239/pexels-photo-1267239.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108102/pexels-photo-1108102.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108103/pexels-photo-1108103.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.50 g/cm³',
      hardness: 'Tendre',
      durability: 'Moyenne',
      color: 'Jaune pâle à brun rosé'
    },
    applications: ['Construction légère', 'Mobilier rustique', 'Lambris', 'Emballage'],
    recommendations: ['Traitement anti-insectes recommandé', 'Bon rapport qualité-prix', 'Facile à usiner'],
    description: 'Le pin est un bois résineux économique et polyvalent, idéal pour les projets de construction et le mobilier d\'entrée de gamme.'
  },
  cedar: {
    images: [
      'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108575/pexels-photo-1108575.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1267239/pexels-photo-1267239.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.38 g/cm³',
      hardness: 'Tendre',
      durability: 'Excellente (naturellement)',
      color: 'Rouge-brun avec aubier blanc'
    },
    applications: ['Bardage extérieur', 'Terrasses', 'Saunas', 'Mobilier de jardin'],
    recommendations: ['Résistance naturelle aux intempéries', 'Parfum agréable', 'Aucun traitement nécessaire'],
    description: 'Le cèdre est naturellement résistant aux insectes et à la pourriture, en faisant un choix excellent pour les applications extérieures.'
  },
  birch: {
    images: [
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.65 g/cm³',
      hardness: 'Mi-dur',
      durability: 'Bonne',
      color: 'Blanc à jaune pâle'
    },
    applications: ['Contreplaqué', 'Mobilier scandinave', 'Jouets', 'Artisanat'],
    recommendations: ['Excellent pour la peinture', 'Grain fin et régulier', 'Économique'],
    description: 'Le bouleau offre un grain fin et une couleur claire, parfait pour les designs modernes et les finitions peintes.'
  },
  cherry: {
    images: [
      'https://images.pexels.com/photos/1108102/pexels-photo-1108102.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108573/pexels-photo-1108573.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.60 g/cm³',
      hardness: 'Mi-dur',
      durability: 'Bonne',
      color: 'Rose saumon à brun rougeâtre'
    },
    applications: ['Mobilier haut de gamme', 'Boiseries', 'Instruments', 'Décoration'],
    recommendations: ['Patine avec le temps', 'Finition à l\'huile recommandée', 'Éviter l\'humidité excessive'],
    description: 'Le cerisier développe une patine riche avec le temps, offrant une beauté naturelle incomparable pour les projets de prestige.'
  },
  mahogany: {
    images: [
      'https://images.pexels.com/photos/1108573/pexels-photo-1108573.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108574/pexels-photo-1108574.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.55 g/cm³',
      hardness: 'Mi-dur',
      durability: 'Excellente',
      color: 'Brun rougeâtre profond'
    },
    applications: ['Mobilier de luxe', 'Bateaux', 'Instruments de musique', 'Sculptures'],
    recommendations: ['Résistant aux insectes', 'Stable dimensionnellement', 'Finition naturelle sublime'],
    description: 'L\'acajou est le bois de référence pour le mobilier de luxe, offrant stabilité, beauté et facilité de travail exceptionnelles.'
  },
  ash: {
    images: [
      'https://images.pexels.com/photos/1108574/pexels-photo-1108574.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.75 g/cm³',
      hardness: 'Dur',
      durability: 'Bonne',
      color: 'Blanc crème à brun pâle'
    },
    applications: ['Manches d\'outils', 'Articles de sport', 'Parquets', 'Mobilier robuste'],
    recommendations: ['Très résistant aux chocs', 'Excellent pour le cintrage', 'Séchage lent nécessaire'],
    description: 'Le frêne est reconnu pour sa résistance exceptionnelle aux chocs, en faisant le choix privilégié pour les applications exigeantes.'
  },
  beech: {
    images: [
      'https://images.pexels.com/photos/1267360/pexels-photo-1267360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.72 g/cm³',
      hardness: 'Dur',
      durability: 'Moyenne',
      color: 'Blanc rosé à brun clair'
    },
    applications: ['Mobilier', 'Jouets', 'Ustensiles de cuisine', 'Parquets'],
    recommendations: ['Excellent pour le tournage', 'Traitement anti-humidité nécessaire', 'Facile à teinter'],
    description: 'Le hêtre offre un grain fin et régulier, parfait pour les applications nécessitant une surface lisse et uniforme.'
  },
  teak: {
    images: [
      'https://images.pexels.com/photos/1108103/pexels-photo-1108103.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108573/pexels-photo-1108573.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1108574/pexels-photo-1108574.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.67 g/cm³',
      hardness: 'Dur',
      durability: 'Exceptionnelle',
      color: 'Brun doré avec veines foncées'
    },
    applications: ['Mobilier de jardin', 'Ponts de bateaux', 'Salles de bain', 'Terrasses'],
    recommendations: ['Résistance naturelle à l\'eau', 'Aucun traitement nécessaire', 'Investissement à long terme'],
    description: 'Le teck est le roi des bois exotiques, offrant une résistance naturelle exceptionnelle à l\'eau et aux intempéries.'
  },
  bamboo: {
    images: [
      'https://images.pexels.com/photos/1108575/pexels-photo-1108575.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1267239/pexels-photo-1267239.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ],
    characteristics: {
      density: '0.60 g/cm³',
      hardness: 'Mi-dur',
      durability: 'Bonne',
      color: 'Jaune pâle à brun miel'
    },
    applications: ['Parquets écologiques', 'Mobilier moderne', 'Cloisons', 'Décoration'],
    recommendations: ['Croissance rapide et durable', 'Résistant à l\'humidité', 'Écologique'],
    description: 'Le bambou est une alternative écologique moderne, offrant résistance et beauté tout en respectant l\'environnement.'
  }
};

const MaterialCard: React.FC<MaterialCardProps> = ({ 
  name, 
  image, 
  material,
  onSelect, 
  onConfirm,
  onBack,
  isSelected, 
  isDetailedView 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const details = materialDetails[material.id];

  useEffect(() => {
    if (isDetailedView) {
      unfoldCard();
    } else {
      foldCard();
    }
  }, [isDetailedView]);

  const unfoldCard = () => {
    if (!cardRef.current || !detailsRef.current || !summaryRef.current) return;

    const tl = gsap.timeline();

    // Masquer la vue résumé
    tl.to(summaryRef.current, {
      duration: 0.3,
      opacity: 0,
      scaleY: 0,
      transformOrigin: "center center",
      ease: "power2.inOut"
    })
    // Redimensionner la carte
    .to(cardRef.current, {
      duration: 0.5,
      width: "100vw",
      height: "100vh",
      ease: "back.out(1.7)"
    }, 0.2)
    // Afficher la vue détaillée
    .fromTo(detailsRef.current, 
      {
        opacity: 0,
        scaleY: 0,
        transformOrigin: "center top"
      },
      {
        duration: 0.6,
        opacity: 1,
        scaleY: 1,
        ease: "elastic.out(1, 0.5)"
      }, 0.4);
  };

  const foldCard = () => {
    if (!cardRef.current || !detailsRef.current || !summaryRef.current) return;

    const tl = gsap.timeline();

    // Masquer la vue détaillée
    tl.to(detailsRef.current, {
      duration: 0.3,
      opacity: 0,
      scaleY: 0,
      transformOrigin: "center top",
      ease: "power2.inOut"
    })
    // Redimensionner la carte
    .to(cardRef.current, {
      duration: 0.4,
      width: "512px",
      height: "288px",
      ease: "power2.inOut"
    }, 0.2)
    // Afficher la vue résumé
    .fromTo(summaryRef.current,
      {
        opacity: 0,
        scaleY: 0,
        transformOrigin: "center center"
      },
      {
        duration: 0.4,
        opacity: 1,
        scaleY: 1,
        ease: "back.out(1.7)"
      }, 0.4);
  };

  const nextImage = () => {
    if (details) {
      setCurrentImageIndex((prev) => (prev + 1) % details.images.length);
    }
  };

  const prevImage = () => {
    if (details) {
      setCurrentImageIndex((prev) => (prev - 1 + details.images.length) % details.images.length);
    }
  };

  const handleClick = () => {
    if (!isDetailedView) {
      onSelect();
    }
  };

  const handleConfirm = () => {
    onConfirm(material);
  };

  if (!details) return null;

  return (
    <div 
      ref={cardRef}
      className={`
        material-card w-128 h-72 rounded-lg shadow-lg border cursor-pointer
        flex flex-col transition-all duration-300 overflow-hidden
        user-select-none hover:shadow-xl transform bg-white
        ${isSelected 
          ? 'border-amber-300 shadow-amber-200/50' 
          : 'border-gray-200 hover:border-amber-200'
        }
      `}
      onClick={handleClick}
      style={{ pointerEvents: isDetailedView ? 'auto' : 'none' }}
    >
      {/* Vue résumé (carte pliée) */}
      <div ref={summaryRef} className={`${isDetailedView ? 'hidden' : 'flex'} flex-col w-full h-full`}>
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        <div className="flex-1 flex items-center justify-center px-2">
          <span className={`
            text-2xl font-medium text-center transition-colors duration-200
            ${isSelected ? 'text-amber-800' : 'text-gray-700'}
          `}>
            {name}
          </span>
        </div>
      </div>

      {/* Vue détaillée (carte dépliée) */}
      <div ref={detailsRef} className={`${!isDetailedView ? 'hidden' : 'flex'} flex-col w-full h-full p-4 overflow-y-auto`}>
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            {name}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Carrousel d'images */}
          <div className="space-y-3">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={details.images[currentImageIndex]}
                alt={`${name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {details.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {details.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Miniatures */}
            <div className="flex gap-2 overflow-x-auto">
              {details.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-10 rounded border overflow-hidden transition-colors ${
                    index === currentImageIndex ? 'border-amber-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${name} - Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Détails du matériau */}
          <div className="space-y-4 text-base">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{details.description}</p>
            </div>

            {/* Caractéristiques */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Caractéristiques
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 p-3 rounded">
                  <div className="text-sm text-amber-700 font-medium">Densité</div>
                  <div className="text-gray-800 text-sm">{details.characteristics.density}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <div className="text-sm text-amber-700 font-medium">Dureté</div>
                  <div className="text-gray-800 text-sm">{details.characteristics.hardness}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <div className="text-sm text-amber-700 font-medium">Durabilité</div>
                  <div className="text-gray-800 text-sm">{details.characteristics.durability}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded">
                  <div className="text-sm text-amber-700 font-medium">Couleur</div>
                  <div className="text-gray-800 text-sm">{details.characteristics.color}</div>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Hammer className="w-5 h-5 text-blue-500" />
                Applications
              </h3>
              <ul className="space-y-2">
                {details.applications.map((app, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    {app}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommandations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Recommandations
              </h3>
              <ul className="space-y-2">
                {details.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4 mt-auto">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center justify-center gap-2 text-base font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 text-base font-medium transition-colors"
          >
            <Check className="w-5 h-5" />
            Sélectionner ce matériau
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;