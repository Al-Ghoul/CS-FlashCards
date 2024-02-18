{
  description = "React Native development shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    # https://github.com/nix-community/nixGL (for reference)
    nixgl.url = "github:guibou/nixGL";
    devenv.url = "github:cachix/devenv";
    # private-configs.url = "git+ssh://git@github.com/Al-Ghoul/ProjectsConfigsAndSecrets";
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = { nixpkgs, nixgl, devenv, ... } @ inputs:
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
        with pkgs; devenv.lib.mkShell {
          inherit inputs pkgs;

          modules = [
            ({ ... }: {
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
                ANDROID_SDK_ROOT = "${androidComposition.androidsdk}/libexec/android-sdk";
                ANDROID_NDK_ROOT = "${ANDROID_SDK_ROOT}/ndk-bundle";
                GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${ANDROID_SDK_ROOT}/build-tools/${buildToolsVersion}/aapt2";
                # Pre-setup an emulator
                # Usually available @ $android/bin/
                android = pkgs.androidenv.emulateApp {
                  configOptions = { "hw.gpu.enabled" = "yes"; }; # Enable GPU acceleration
                  name = "AlGhoul's-Emulator";
                  platformVersion = "29";
                  abiVersion = "x86";
                  systemImageType = "google_apis_playstore";
                  # Resolution could be anything you want, keep the others if your Hardware supports KVM (for better performance)
                  androidEmulatorFlags = "-skin 480x800 -accel on -gpu host -qemu -enable-kvm";
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

              scripts.pre.exec = ''
                exec .git/hooks/pre-commit
              '';

              enterShell = ''
                echo "Node: `${pkgs.nodejs_18}/bin/node --version`" # Shows Node version on shell start
                echo 'To launch the emulator run: nixGLIntel $android/bin/run-test-emulator'  # Launch the emulator (Replace nixGLIntel accordingly, for info refer to nixGL docs)
                echo "If you're on nvidia replace 'nixGLIntel' accordingly"
              '';
            })

          ];
        };

      /*      gradle8 = with pkgs; stdenv.mkDerivation rec {
      pname = "gradle";
      version = "8.0.1";
      nativeVersion = "0.22-milestone-24";
      src = builtins.fetchurl {
        url =
          "https://services.gradle.org/distributions/gradle-${version}-bin.zip";
          sha256 = "02g9i1mrpdydj8d6395cv6a4ny9fw3z7sjzr7n6l6a9zx65masqv";
        };
      javaToolchains = [ ];

      dontBuild = true;

      nativeBuildInputs = [ makeWrapper unzip ];
      buildInputs = [ jdk17 ];

      installPhase = with builtins;
        let
          toolchain = rec {
            prefix = x: "JAVA_TOOLCHAIN_NIX_${toString x}";
            varDefs  = (lib.imap0 (i: x: "${prefix i} ${x}") javaToolchains);
            varNames = lib.imap0 (i: x: prefix i) javaToolchains;
            property = " -Porg.gradle.java.installations.fromEnv='${
                 concatStringsSep "," varNames
               }'";
          };
          varDefs = concatStringsSep "\n" (map (x: "  --set ${x} \\")
            ([ "JAVA_HOME ${jdk17}" ] ++ toolchain.varDefs));
        in ''
          mkdir -pv $out/lib/gradle/
          cp -rv lib/ $out/lib/gradle/

          gradle_launcher_jar=$(echo $out/lib/gradle/lib/gradle-launcher-*.jar)
          test -f $gradle_launcher_jar
          makeWrapper ${jdk17}/bin/java $out/bin/gradle \
            ${varDefs}
            --add-flags "-classpath $gradle_launcher_jar org.gradle.launcher.GradleMain${toolchain.property}"
        '';

      dontFixup = !stdenv.isLinux;

      fixupPhase = let arch = if stdenv.is64bit then "amd64" else "i386";
      in ''
        for variant in "" "-ncurses5" "-ncurses6"; do
          mkdir "patching$variant"
          pushd "patching$variant"
          jar xf $out/lib/gradle/lib/native-platform-linux-${arch}$variant-${nativeVersion}.jar
          patchelf \
            --set-rpath "${stdenv.cc.cc.lib}/lib64:${lib.makeLibraryPath [ stdenv.cc.cc ncurses5 ncurses6 ]}" \
            net/rubygrapefruit/platform/linux-${arch}$variant/libnative-platform*.so
          jar cf native-platform-linux-${arch}$variant-${nativeVersion}.jar .
          mv native-platform-linux-${arch}$variant-${nativeVersion}.jar $out/lib/gradle/lib/
          popd
        done

        # The scanner doesn't pick up the runtime dependency in the jar.
        # Manually add a reference where it will be found.
        mkdir $out/nix-support
        echo ${stdenv.cc.cc} > $out/nix-support/manual-runtime-dependencies
        # Gradle will refuse to start without _both_ 5 and 6 versions of ncurses.
        echo ${ncurses5} >> $out/nix-support/manual-runtime-dependencies
        echo ${ncurses6} >> $out/nix-support/manual-runtime-dependencies
        '';

        meta = {
          mainProgram = "gradle";
        };
      };
       
      hydraJobs = rec {

        # NOTE: building on nix does NOT work, it needs a writable FHS
        # FIX:Unable to initialize metrics, ensure /var/empty/.android is writable, details: /var/empty/.android/analytics.settings (No such file or directory)

        pre-build = with pkgs; mkYarnPackage rec {
      name = "CS-FlashCards-PreBuild";
      src = self;
      version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
      __noChroot = true;
      nativeBuildInputs = [
        # gradle8
        cacert
        yarn
      ];
      
      NODE_ENV = "production";
      packageJSON = ./package.json;
      yarnLock = ./yarn.lock;

      offlineCache = fetchYarnDeps {
        inherit yarnLock;
        hash = "sha256-Q8z0cy3bjVzsYUOJEHPnOpzPrCkGCYrKB+Cn/9mMu28=";
      }; 

      configurePhase = ''
        export HOME=$(mktemp -d)
        cp -r $node_modules node_modules
        cp ${private-configs}/ReactNative/CS-FlashCards/google-services.json .
      '';

           buildPhase = ''
       runHook preBuild
       export EXPO_NO_GIT_STATUS=1
       yarn expo prebuild --clean --no-install --platform android

       if ! [ -d "$PWD/android" ]; then
         echo "Failed to create android build"
         exit 1  
       fi
  
       runHook postBuild
           '';

           installPhase = ''
       runHook preInstall
       mkdir $out
       cp -r {.,}* $out
       runHook postInstall
           '';

           doDist = false;
           doCheck = false;
           dontFixup = true;
           };
     
           build = let
        # These specific versions are REQUIRED by react native
        # Please do NOT mess with them unless you know what you're doing.
        buildToolsVersion =  "33.0.0";
        androidComposition = pkgs.androidenv.composeAndroidPackages {
          toolsVersion = null;
          platformVersions = [ "33" ];
          buildToolsVersions =  [ buildToolsVersion "30.0.3" ];
          includeNDK = true;
          ndkVersions = [ "23.1.7779620" ];
          cmakeVersions = [ "3.22.1" ];
        };
           in 
           pkgs.stdenvNoCC.mkDerivation (finalAttrs: rec {
           name = "build-android";
           srcs = pre-build.out;
           sourceRoot = "${srcs.name}/android";
           __noChroot = true;
           nativeBuildInputs = with pkgs; [ 
       gradle8
       jdk17 
       cacert
       nodejs_18
       androidComposition.platform-tools # Expose platform tools (aka adb & other executables)
           ];

           configurePhase = ''
       runHook preConfigure
       export GRADLE_USER_HOME=$(mktemp -d)
       chmod -R +w ../node_modules
       export ANDROID_SDK_ROOT="${androidComposition.androidsdk}/libexec/android-sdk";
       export ANDROID_NDK_ROOT=$ANDROID_SDK_ROOT/ndk-bundle;
       export GRADLE_OPTS=-Dorg.gradle.project.android.aapt2FromMavenOverride=$ANDROID_SDK_ROOT/build-tools/${buildToolsVersion}/aapt2;

       runHook postConfigure   
           '';

           buildPhase = ''
       runHook preBuild
       gradle assembleRelease
       runHook postBuild
           '';
           });

           buildInVM = with pkgs; with vmTools; runInLinuxVM (build.overrideAttrs (_: {
           preVM = createEmptyImage {
       size = 5 * 1024;
       fullName = "Build-Storage";
           };
           memSize = 2 * 1024;
           QEMU_OPTS = "-netdev user,id=net0 -device virtio-net-pci,netdev=net0";
         }));  

      };*/
    };
}
