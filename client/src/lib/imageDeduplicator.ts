import { Experience } from '../types';

/**
 * Rich, verified catalog of distinct high-resolution Indian cultural imagery (Pexels / Unsplash CDN).
 * Every URL here is distinct with 0 duplicate image IDs.
 */
export const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  food: [
    'https://images.pexels.com/photos/4602266/pexels-photo-4602266.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/16308804/pexels-photo-16308804.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/37255838/pexels-photo-37255838.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  art: [
    'https://images.pexels.com/photos/28389703/pexels-photo-28389703.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/20242195/pexels-photo-20242195.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1327689/pexels-photo-1327689.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2261165/pexels-photo-2261165.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  heritage: [
    'https://images.pexels.com/photos/7107597/pexels-photo-7107597.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/18499072/pexels-photo-18499072.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/15682803/pexels-photo-15682803.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/10975757/pexels-photo-10975757.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/32196020/pexels-photo-32196020.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/14815159/pexels-photo-14815159.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/17376351/pexels-photo-17376351.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/32164946/pexels-photo-32164946.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2403209/pexels-photo-2403209.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2444403/pexels-photo-2444403.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/574313/pexels-photo-574313.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  culture: [
    'https://images.pexels.com/photos/27833051/pexels-photo-27833051.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/11566792/pexels-photo-11566792.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/14041885/pexels-photo-14041885.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/32498309/pexels-photo-32498309.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/236171/pexels-photo-236171.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/18262579/pexels-photo-18262579.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  spiritual: [
    'https://images.pexels.com/photos/5756687/pexels-photo-5756687.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/39217137/pexels-photo-39217137.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/17433337/pexels-photo-17433337.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/18089549/pexels-photo-18089549.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6174060/pexels-photo-6174060.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8450469/pexels-photo-8450469.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  nature: [
    'https://images.pexels.com/photos/1483053/pexels-photo-1483053.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931018/pexels-photo-931018.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2861280/pexels-photo-2861280.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/34682732/pexels-photo-34682732.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/35971200/pexels-photo-35971200.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6892490/pexels-photo-6892490.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  adventure: [
    'https://images.pexels.com/photos/36870020/pexels-photo-36870020.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1365428/pexels-photo-1365428.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  nightlife: [
    'https://images.pexels.com/photos/30570738/pexels-photo-30570738.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/37904044/pexels-photo-37904044.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/28106225/pexels-photo-28106225.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/37133961/pexels-photo-37133961.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

export function getCategoryPoolKey(category: string = ''): string {
  const cat = category.toLowerCase();
  if (cat.includes('food') || cat.includes('culinary') || cat.includes('tea') || cat.includes('dining')) return 'food';
  if (cat.includes('art') || cat.includes('craft') || cat.includes('workshop') || cat.includes('textile') || cat.includes('pottery')) return 'art';
  if (cat.includes('heritage') || cat.includes('history') || cat.includes('monument') || cat.includes('palace') || cat.includes('fort') || cat.includes('bridge') || cat.includes('mosque') || cat.includes('qila')) return 'heritage';
  if (cat.includes('nature') || cat.includes('wildlife') || cat.includes('beach') || cat.includes('backwater') || cat.includes('lake') || cat.includes('river')) return 'nature';
  if (cat.includes('night') || cat.includes('evening') || cat.includes('sunset') || cat.includes('music')) return 'nightlife';
  if (cat.includes('adventure') || cat.includes('trek') || cat.includes('sport') || cat.includes('outdoor')) return 'adventure';
  if (cat.includes('spiritual') || cat.includes('wellness') || cat.includes('temple') || cat.includes('ghat') || cat.includes('dham')) return 'spiritual';
  return 'culture';
}

export function getUniqueImageForExperience(
  experience: Experience,
  index: number = 0,
  seenUrls: Set<string>
): string {
  const rawImage =
    experience.image_url ||
    (experience.image_urls && experience.image_urls.length > 0 ? experience.image_urls[0] : null) ||
    (experience.images && experience.images.length > 0 ? experience.images[0] : null);

  if (rawImage && !rawImage.includes('placeholder') && !rawImage.includes('source.unsplash.com')) {
    if (!seenUrls.has(rawImage)) {
      seenUrls.add(rawImage);
      return rawImage;
    }
  }

  if (experience.image_urls && experience.image_urls.length > 1) {
    for (const u of experience.image_urls) {
      if (u && !u.includes('placeholder') && !seenUrls.has(u)) {
        seenUrls.add(u);
        return u;
      }
    }
  }

  const poolKey = getCategoryPoolKey(experience.category);
  const pool = CATEGORY_IMAGE_POOLS[poolKey] || CATEGORY_IMAGE_POOLS.culture;

  let seed = index;
  if (experience.id) seed += typeof experience.id === 'number' ? experience.id : 0;
  if (experience.title) {
    for (let i = 0; i < experience.title.length; i++) {
      seed = (seed * 31 + experience.title.charCodeAt(i)) >>> 0;
    }
  }

  for (let offset = 0; offset < pool.length; offset++) {
    const candidate = pool[(seed + offset) % pool.length];
    if (!seenUrls.has(candidate)) {
      seenUrls.add(candidate);
      return candidate;
    }
  }

  const allPools = Object.values(CATEGORY_IMAGE_POOLS).flat();
  for (let offset = 0; offset < allPools.length; offset++) {
    const candidate = allPools[(seed + offset) % allPools.length];
    if (!seenUrls.has(candidate)) {
      seenUrls.add(candidate);
      return candidate;
    }
  }

  return pool[seed % pool.length];
}

export function deduplicateExperienceList(experiences: Experience[]): Experience[] {
  if (!Array.isArray(experiences) || experiences.length === 0) return experiences;

  const seenUrls = new Set<string>();

  return experiences.map((exp, idx) => {
    const uniqueImg = getUniqueImageForExperience(exp, idx, seenUrls);
    return {
      ...exp,
      image_url: uniqueImg,
    };
  });
}
