import MusicPlayer from './MusicPlayer';
import type { MusicCategory } from '../utils/soundEngine';

interface Props { category?: MusicCategory; }

export default function SoundControl({ category = 'home' }: Props) {
  return <MusicPlayer category={category} compact/>;
}
