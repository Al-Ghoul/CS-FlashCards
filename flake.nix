{
  description = "React Native development shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    # https://github.com/nix-community/nixGL (for reference)
    nixgl.url = "github:guibou/nixGL";
    devenv.url = "github:cachix/devenv";
  };

  nixConfig = {
    extra-trusted-public-keys =
      "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = { nixpkgs, nixgl, devenv, ... }@inputs:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        config.allowUnfree = true;
        config.android_sdk.accept_license = true;
        overlays = [ nixgl.overlay ];
        inherit system;
      };
    in
    rec {
      devShells."${system}".default =
        let
          # These specific versions are REQUIRED by react native
          # Please do NOT mess with them unless you know what you're doing.
          buildToolsVersion = "33.0.0";
          androidComposition = pkgs.androidenv.composeAndroidPackages {
            toolsVersion = null;
            platformVersions = [ "33" ];
            buildToolsVersions = [ buildToolsVersion "30.0.3" ];
            includeNDK = true;
            ndkVersions = [ "23.1.7779620" ];
            cmakeVersions = [ "3.22.1" ];
          };

        in
        with pkgs;
        devenv.lib.mkShell {
          inherit inputs pkgs;

          modules = [
            (_: {
              packages = [
                nodejs_18
                jdk17
                watchman # Required for 'metro' for better performance
                androidComposition.platform-tools # Expose platform tools (aka adb & other executables)
                pkgs.nixgl.nixGLIntel # Fixes GPU usage issue; GLIntel only supports AMD & Intel GPUs, for Nvidia you might wanna use other options.
                nodePackages.eas-cli # Expo's EAS Update CLI
                yarn
                cz-cli
                firebase-tools
                nodePackages.dotenv-cli
              ];

              env = rec {
                # Expose required ENV variables
                ANDROID_SDK_ROOT =
                  "${androidComposition.androidsdk}/libexec/android-sdk";
                ANDROID_NDK_ROOT = "${ANDROID_SDK_ROOT}/ndk-bundle";
                GRADLE_OPTS =
                  "-Dorg.gradle.project.android.aapt2FromMavenOverride=${ANDROID_SDK_ROOT}/build-tools/${buildToolsVersion}/aapt2";
                # Pre-setup an emulator
                # Usually available @ $android/bin/
                android = pkgs.androidenv.emulateApp {
                  configOptions = {
                    "hw.gpu.enabled" = "yes";
                  }; # Enable GPU acceleration
                  name = "AlGhoul's-Emulator";
                  platformVersion = "29";
                  abiVersion = "x86";
                  systemImageType = "google_apis_playstore";
                  # Resolution could be anything you want, keep the others if your Hardware supports KVM (for better performance)
                  androidEmulatorFlags =
                    "-skin 480x800 -accel on -gpu host -qemu -enable-kvm";
                };
              };

              pre-commit.hooks = {
                deadnix.enable = true;
                nixpkgs-fmt.enable = true;

                denofmt.enable = true;
                denolint.enable = true;

                commitizen.enable = true;
                markdownlint.enable = true;
              };

              scripts.dev.exec = ''
                nixGLIntel  $android/bin/run-test-emulator && yarn android
              '';

              enterShell = ''
                echo "Node: `${pkgs.nodejs_18}/bin/node --version`" # Shows Node version on shell start
                echo "type 'dev' to launch the emulator & launch the app/metro"
              '';

            })

          ];
        };

    };
}
