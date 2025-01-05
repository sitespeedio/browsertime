export async function loadCustomJimp() {
  try {
    const { default: configure } = await import('@jimp/custom');
    const { default: pluginPng } = await import('@jimp/png');
    const { default: pluginJpeg } = await import('@jimp/jpeg');
    const { default: pluginScale } = await import('@jimp/plugin-scale');
    // The scale plugin use resize
    const { default: pluginResize } = await import('@jimp/plugin-resize');
    const jimp = configure({
      types: [pluginPng, pluginJpeg],
      plugins: [pluginResize, pluginScale]
    });
    return jimp;
  } catch {
    return;
  }
}
