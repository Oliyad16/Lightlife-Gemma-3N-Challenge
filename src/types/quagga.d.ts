declare module 'quagga' {
  interface QuaggaConfig {
    inputStream?: {
      name: string;
      type: string;
      target: HTMLVideoElement | HTMLElement;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
      };
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    frequency?: number;
    decoder?: {
      readers: string[];
    };
    locate?: boolean;
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
    };
  }

  namespace Quagga {
    function init(config: QuaggaConfig, callback?: (error: unknown) => void): void;
    function start(): void;
    function stop(): void;
    function onDetected(callback: (result: QuaggaResult) => void): void;
  }

  export = Quagga;
}