// Chinese kinship term lookup table
// Key format: comma-separated path steps from "me" to target
// e.g. "father,father" → 爷爷 (paternal grandfather)

export const kinshipTermMap: Record<string, string> = {
  // Self
  '': '我',

  // Parents
  father: '爸爸',
  mother: '妈妈',

  // Grandparents (paternal)
  'father,father': '爷爷',
  'father,mother': '奶奶',

  // Grandparents (maternal)
  'mother,father': '外公',
  'mother,mother': '外婆',

  // Great-grandparents (paternal)
  'father,father,father': '曾祖父',
  'father,father,mother': '曾祖母',
  'mother,father,father': '外曾祖父',
  'mother,father,mother': '外曾祖母',
  'father,mother,father': '曾外祖父',
  'father,mother,mother': '曾外祖母',
  'mother,mother,father': '外曾外祖父',
  'mother,mother,mother': '外曾外祖母',

  // Children
  son: '儿子',
  daughter: '女儿',

  // Grandchildren
  'son,son': '孙子',
  'son,daughter': '孙女',
  'daughter,son': '外孙',
  'daughter,daughter': '外孙女',

  // Spouse
  husband: '丈夫',
  wife: '妻子',

  // Siblings
  elder_brother: '哥哥',
  younger_brother: '弟弟',
  elder_sister: '姐姐',
  younger_sister: '妹妹',

  // Parents' siblings (paternal)
  'father,elder_brother': '伯父',
  'father,younger_brother': '叔叔',
  'father,elder_sister': '姑姑',
  'father,younger_sister': '姑姑',

  // Parents' siblings' spouses (paternal)
  'father,elder_brother,wife': '伯母',
  'father,younger_brother,wife': '婶婶',
  'father,elder_sister,husband': '姑父',
  'father,younger_sister,husband': '姑父',

  // Parents' siblings (maternal)
  'mother,elder_brother': '舅舅',
  'mother,younger_brother': '舅舅',
  'mother,elder_sister': '姨妈',
  'mother,younger_sister': '阿姨',

  // Parents' siblings' spouses (maternal)
  'mother,elder_brother,wife': '舅妈',
  'mother,younger_brother,wife': '舅妈',
  'mother,elder_sister,husband': '姨父',
  'mother,younger_sister,husband': '姨父',

  // Cousins (paternal uncle's children)
  'father,elder_brother,son': '堂兄',
  'father,elder_brother,daughter': '堂姐',
  'father,younger_brother,son': '堂弟',
  'father,younger_brother,daughter': '堂妹',

  // Cousins (paternal aunt's children)
  'father,elder_sister,son': '表兄',
  'father,elder_sister,daughter': '表姐',
  'father,younger_sister,son': '表弟',
  'father,younger_sister,daughter': '表妹',

  // Cousins (maternal uncle's children)
  'mother,elder_brother,son': '表兄',
  'mother,elder_brother,daughter': '表姐',
  'mother,younger_brother,son': '表弟',
  'mother,younger_brother,daughter': '表妹',

  // Cousins (maternal aunt's children)
  'mother,elder_sister,son': '表兄',
  'mother,elder_sister,daughter': '表姐',
  'mother,younger_sister,son': '表弟',
  'mother,younger_sister,daughter': '表妹',

  // Siblings' children
  'elder_brother,son': '侄子',
  'elder_brother,daughter': '侄女',
  'younger_brother,son': '侄子',
  'younger_brother,daughter': '侄女',
  'elder_sister,son': '外甥',
  'elder_sister,daughter': '外甥女',
  'younger_sister,son': '外甥',
  'younger_sister,daughter': '外甥女',

  // Children's spouses
  'son,wife': '儿媳妇',
  'daughter,husband': '女婿',

  // Spouse's parents
  'husband,father': '公公',
  'husband,mother': '婆婆',
  'wife,father': '岳父',
  'wife,mother': '岳母',

  // Siblings' spouses
  'elder_brother,wife': '嫂子',
  'younger_brother,wife': '弟媳',
  'elder_sister,husband': '姐夫',
  'younger_sister,husband': '妹夫',

  // Spouse's siblings
  'husband,elder_brother': '大伯子',
  'husband,younger_brother': '小叔子',
  'husband,elder_sister': '大姑子',
  'husband,younger_sister': '小姑子',
  'wife,elder_brother': '大舅子',
  'wife,younger_brother': '小舅子',
  'wife,elder_sister': '大姨子',
  'wife,younger_sister': '小姨子',
};

// Fallback generic terms when exact path not found
export const genericTerms: Record<string, string> = {
  father: '父亲',
  mother: '母亲',
  son: '儿子',
  daughter: '女儿',
  husband: '丈夫',
  wife: '妻子',
  elder_brother: '兄',
  younger_brother: '弟',
  elder_sister: '姐',
  younger_sister: '妹',
};
