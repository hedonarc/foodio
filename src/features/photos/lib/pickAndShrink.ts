import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { PhotoContentType } from '../types/photo.types';

import { resizeTo } from './resize';

/**
 * Everything is re-encoded to JPEG, whatever came out of the library.
 *
 * An iPhone photograph is usually HEIC, which the bucket's allowlist refuses —
 * and finding that out after a slow upload on mobile data is the worst possible
 * moment. Re-encoding also means the content type is known rather than guessed
 * from a file extension, and a PNG screenshot of a menu gets compressed instead
 * of being uploaded whole.
 */
export const UPLOAD_CONTENT_TYPE: PhotoContentType = 'image/jpeg';

/** Enough that a photograph looks right on a phone, small enough to send on mobile data. */
const QUALITY = 0.85;

export type PickedPhoto = { uri: string };

/**
 * Opens the library, shrinks what comes back, and hands over a local file.
 * `undefined` means the owner backed out, which is not an error.
 */
export async function pickAndShrink(): Promise<PickedPhoto | undefined> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  const asset = picked.canceled ? undefined : picked.assets[0];
  if (!asset) return undefined;

  const resize = resizeTo({ width: asset.width, height: asset.height });

  const context = ImageManipulator.ImageManipulator.manipulate(asset.uri);
  if (resize) context.resize(resize);

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress: QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return { uri: saved.uri };
}
