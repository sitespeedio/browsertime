export async function loadCustomJimp() {
  try {
    const { Jimp } = await import('jimp');

    return Jimp;
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      return;
    }

    throw error;
  }
}
