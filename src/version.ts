// Single source of truth for the package version. Bumped by the release
// workflow (.github/workflows/release.yml) on `git tag vX.Y.Z` push.
//
// Lockstep with the Python (`socialapis-sdk` on PyPI) and Go
// (`github.com/SocialAPIsHub/socialapis-go`) SDKs in this family. All
// three start at 0.1.1 so users know the SDKs are at feature parity.
export const VERSION = "0.1.1";
