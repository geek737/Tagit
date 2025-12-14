import type { ErrorType } from "@/components/ErrorPage";

export interface ErrorInfo {
  message: string;
  type: 'network' | 'credentials' | 'server' | 'permission' | 'validation' | 'unknown';
  httpStatus?: ErrorType;
}

export function getErrorMessage(error: unknown): ErrorInfo {
  if (!navigator.onLine) {
    return {
      message: 'Connexion internet perdue. Verifiez votre reseau et reessayez.',
      type: 'network',
      httpStatus: 'offline'
    };
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const errorCode = err.code as string | undefined;
    const errorMessage = (err.message as string)?.toLowerCase() || '';
    const status = err.status as number | undefined;

    if (status === 400 || errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
      return {
        message: 'Requete invalide. Veuillez verifier les donnees saisies.',
        type: 'validation',
        httpStatus: 400
      };
    }

    if (status === 401 || errorMessage.includes('unauthenticated') || errorMessage.includes('not authenticated')) {
      return {
        message: 'Session expiree. Veuillez vous reconnecter.',
        type: 'credentials',
        httpStatus: 401
      };
    }

    if (
      status === 403 ||
      errorCode === 'PGRST301' ||
      errorCode === '42501' ||
      errorMessage.includes('permission') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden')
    ) {
      return {
        message: 'Acces refuse. Vous n\'avez pas les permissions necessaires.',
        type: 'permission',
        httpStatus: 403
      };
    }

    if (status === 404 || errorMessage.includes('not found')) {
      return {
        message: 'Ressource introuvable.',
        type: 'server',
        httpStatus: 404
      };
    }

    if (
      errorCode === 'PGRST116' ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('failed to fetch')
    ) {
      return {
        message: 'Impossible de contacter le serveur. Verifiez votre connexion.',
        type: 'network',
        httpStatus: 'offline'
      };
    }

    if (
      status === 500 ||
      status === 502 ||
      errorCode?.startsWith('PGRST') ||
      errorMessage.includes('database') ||
      errorMessage.includes('server') ||
      errorMessage.includes('internal')
    ) {
      return {
        message: 'Erreur serveur. Veuillez reessayer dans quelques instants.',
        type: 'server',
        httpStatus: 500
      };
    }

    if (status === 503 || errorMessage.includes('maintenance') || errorMessage.includes('unavailable')) {
      return {
        message: 'Service temporairement indisponible. Reessayez bientot.',
        type: 'server',
        httpStatus: 503
      };
    }
  }

  return {
    message: 'Une erreur inattendue est survenue. Veuillez reessayer.',
    type: 'unknown',
    httpStatus: 'unknown'
  };
}

export function getLoginErrorMessage(error: unknown): string {
  const errorInfo = getErrorMessage(error);

  if (errorInfo.type === 'network') {
    return 'Impossible de se connecter au serveur. Verifiez votre connexion internet.';
  }

  if (errorInfo.type === 'server') {
    return 'Probleme technique en cours. Veuillez reessayer dans quelques instants.';
  }

  return 'Identifiant ou mot de passe incorrect. Veuillez reessayer.';
}

export function getHttpStatusFromError(error: unknown): ErrorType {
  const errorInfo = getErrorMessage(error);
  return errorInfo.httpStatus || 'unknown';
}
