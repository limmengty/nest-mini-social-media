import { Hash } from 'src/utils/Hash';
import { ValueTransformer } from 'typeorm';

export class PasswordTransformer implements ValueTransformer {
  /**
   * Transform to custom value
   * @param value value to transform
   */
  to(value) {
    if (value == undefined) {
      // for OAuth2 User
      return Hash.make('prop');
    }
    console.log(Hash.make(value));
    return Hash.make(value);
  }

  /**
   * Original value
   * @param value to be transformed
   */
  from(value) {
    console.log('value:', value);
    return value;
  }
}
